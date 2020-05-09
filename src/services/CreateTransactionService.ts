import AppError from '../errors/AppError';
import { getCustomRepository, getRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: string;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);

    if (!(type === 'income' || type === 'outcome')) {
      throw new AppError('Invalid or missing type');
    }

    if (!category || category === '') {
      throw new AppError('Blank or missing category');
    }

    if (!title || title === '') {
      throw new AppError('Blank or missing title');
    }

    if (!value || value === 0) {
      throw new AppError('Zero or missing value');
    }

    const balance = await transactionRepository.getBalance();

    if (type === 'outcome' && value > balance.total) {
      throw new AppError('Not enought funds');
    }

    const categoryRepository = getRepository(Category);

    let categoryData = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!categoryData) {
      categoryData = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(categoryData);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      category_id: categoryData.id,
      type,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
