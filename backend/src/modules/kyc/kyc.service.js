import prisma from '../../config/prisma.js';
import { uploadToCloudinary } from '../../config/cloudinary.js';
import env from '../../config/env.js';

// ─── Onfido API helper ───────────────────────────────────────────────────────
// Called only when ONFIDO_API_TOKEN is configured. Gracefully degrades to
// manual-review mode when the token is absent.

const ONFIDO_BASE = 'https://api.eu.onfido.com/v3.6';

const onfidoRequest = async (path, options = {}) => {
  const res = await fetch(`${ONFIDO_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Token token=${env.ONFIDO_API_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Onfido API error ${res.status}: ${body}`);
  }
  return res.json();
};

const createOnfidoApplicant = (user) =>
  onfidoRequest('/applicants', {
    method: 'POST',
    body: JSON.stringify({
      first_name: (user.name || user.username || '').split(' ')[0] || 'Unknown',
      last_name: (user.name || user.username || '').split(' ').slice(1).join(' ') || 'Unknown',
      email: user.email,
    }),
  });

const createOnfidoCheck = (applicantId) =>
  onfidoRequest('/checks', {
    method: 'POST',
    body: JSON.stringify({
      applicant_id: applicantId,
      report_names: ['document', 'facial_similarity_photo'],
    }),
  });

// ─── Submit KYC documents ────────────────────────────────────────────────────

export const submitKYC = async (userId, files, documentType) => {
  // One KYC record per user — update if exists and was rejected
  const existing = await prisma.userKYC.findUnique({ where: { userId } });
  if (existing && existing.status === 'APPROVED') {
    throw Object.assign(new Error('Identity already verified'), { statusCode: 400 });
  }
  if (existing && existing.status === 'PENDING') {
    throw Object.assign(new Error('Verification already submitted and under review'), { statusCode: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, username: true, email: true },
  });

  // Upload documents to Cloudinary
  const uploadOpts = { folder: 'housely/kyc', resource_type: 'image' };

  const [frontResult, backResult, selfieResult] = await Promise.all([
    uploadToCloudinary(files.documentFront.buffer, uploadOpts),
    files.documentBack ? uploadToCloudinary(files.documentBack.buffer, uploadOpts) : null,
    uploadToCloudinary(files.selfie.buffer, uploadOpts),
  ]);

  let onfidoApplicantId = null;
  let onfidoCheckId = null;

  // If Onfido token is configured, create applicant and check
  if (env.ONFIDO_API_TOKEN) {
    try {
      const applicant = await createOnfidoApplicant(user);
      onfidoApplicantId = applicant.id;

      const check = await createOnfidoCheck(onfidoApplicantId);
      onfidoCheckId = check.id;
    } catch (err) {
      // Log but don't fail the submission — falls back to manual review
      console.error('[KYC] Onfido API error (falling back to manual review):', err.message);
    }
  }

  const data = {
    userId,
    documentType: documentType || 'nid',
    documentFront: frontResult.secure_url,
    documentBack: backResult?.secure_url ?? null,
    selfie: selfieResult.secure_url,
    onfidoApplicantId,
    onfidoCheckId,
    status: 'PENDING',
    submittedAt: new Date(),
    reviewedAt: null,
    rejectionNote: null,
  };

  if (existing) {
    return prisma.userKYC.update({ where: { userId }, data });
  }
  return prisma.userKYC.create({ data });
};

// ─── Get KYC status for a user ───────────────────────────────────────────────

export const getKYCStatus = async (userId) => {
  const record = await prisma.userKYC.findUnique({ where: { userId } });
  if (!record) {
    return { status: 'NOT_SUBMITTED', record: null };
  }
  return { status: record.status, record };
};

// ─── Admin: review KYC ───────────────────────────────────────────────────────

export const reviewKYC = async (targetUserId, { status, rejectionNote }) => {
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    throw Object.assign(new Error('Status must be APPROVED or REJECTED'), { statusCode: 400 });
  }

  const record = await prisma.userKYC.findUnique({ where: { userId: targetUserId } });
  if (!record) {
    throw Object.assign(new Error('KYC record not found'), { statusCode: 404 });
  }

  const updated = await prisma.userKYC.update({
    where: { userId: targetUserId },
    data: {
      status,
      rejectionNote: status === 'REJECTED' ? (rejectionNote || 'Verification failed') : null,
      reviewedAt: new Date(),
    },
  });

  // Mark user as verified in User table when approved
  if (status === 'APPROVED') {
    await prisma.user.update({
      where: { id: targetUserId },
      data: { isVerified: true },
    });
  }

  return updated;
};

// ─── Onfido webhook handler ───────────────────────────────────────────────────
// Onfido posts to POST /api/kyc/webhook when a check completes.

export const handleOnfidoWebhook = async (payload) => {
  if (payload?.payload?.action !== 'check.completed') return;

  const checkId = payload?.payload?.object?.id;
  if (!checkId) return;

  const record = await prisma.userKYC.findFirst({ where: { onfidoCheckId: checkId } });
  if (!record) return;

  const result = payload?.payload?.object?.result;
  const status = result === 'clear' ? 'APPROVED' : 'REJECTED';
  const rejectionNote = status === 'REJECTED' ? 'Automated verification did not pass' : null;

  await prisma.userKYC.update({
    where: { id: record.id },
    data: { status, rejectionNote, reviewedAt: new Date() },
  });

  if (status === 'APPROVED') {
    await prisma.user.update({ where: { id: record.userId }, data: { isVerified: true } });
  }
};

// ─── Admin: list all pending KYC records ─────────────────────────────────────

export const listKYCRecords = async ({ status, page = 1, limit = 20 }) => {
  page = Number(page);
  limit = Number(limit);
  const skip = (page - 1) * limit;
  const where = status ? { status } : {};

  const [records, total] = await Promise.all([
    prisma.userKYC.findMany({
      where,
      skip,
      take: limit,
      orderBy: { submittedAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    }),
    prisma.userKYC.count({ where }),
  ]);

  return { records, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};
