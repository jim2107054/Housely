import * as kycService from './kyc.service.js';
import { success, error } from '../../utils/response.js';

export const submitKYC = async (req, res, next) => {
  try {
    if (!req.files?.documentFront?.[0] || !req.files?.selfie?.[0]) {
      return error(res, 'documentFront and selfie are required', 400);
    }

    const files = {
      documentFront: req.files.documentFront[0],
      documentBack: req.files.documentBack?.[0] || null,
      selfie: req.files.selfie[0],
    };

    const record = await kycService.submitKYC(req.user.id, files, req.body.documentType);
    return success(res, record, 'KYC documents submitted successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const getKYCStatus = async (req, res, next) => {
  try {
    const result = await kycService.getKYCStatus(req.user.id);
    return success(res, result, 'KYC status retrieved');
  } catch (err) {
    next(err);
  }
};

export const handleWebhook = async (req, res, next) => {
  try {
    await kycService.handleOnfidoWebhook(req.body);
    return res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
};

// Admin endpoints

export const listKYCRecords = async (req, res, next) => {
  try {
    const result = await kycService.listKYCRecords(req.query);
    return success(res, result, 'KYC records retrieved');
  } catch (err) {
    next(err);
  }
};

export const reviewKYC = async (req, res, next) => {
  try {
    const record = await kycService.reviewKYC(req.params.userId, req.body);
    return success(res, record, 'KYC reviewed successfully');
  } catch (err) {
    next(err);
  }
};
