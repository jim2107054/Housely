import * as contractService from './contract.service.js';
import { success } from '../../utils/response.js';

export const getContractByBooking = async (req, res, next) => {
  try {
    const contract = await contractService.getContractByBooking(req.user.id, req.params.bookingId);
    return success(res, contract, 'Contract retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const getAllContracts = async (req, res, next) => {
  try {
    const result = await contractService.getAllContracts(req.query);
    return success(res, result, 'Contracts retrieved successfully');
  } catch (err) {
    next(err);
  }
};
