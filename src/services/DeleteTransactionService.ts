import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import { getRepository } from 'typeorm';
import { isUuid } from 'uuidv4';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionRepository = getRepository(Transaction);

    if (!isUuid(id)) {
      throw new AppError('Invalid ID.');
    }

    const transaction = await transactionRepository.findOne(id);

    console.log(transaction);

    if (!transaction) {
      throw new AppError('Transaction doest not exist.');
    }

    transactionRepository.delete(id);
  }
}

export default DeleteTransactionService;
