import Transaction from '../models/Transaction';
import { getRepository } from 'typeorm';
import uploadConfig from '../config/upload';
import fs from 'fs';
import path from 'path';
import csvParse from 'csv-parse';
import CreateTransactionService from './CreateTransactionService';

class ImportTransactionsService {
  async execute(fileName: string): Promise<Transaction[]> {
    const readCSVStream = fs.createReadStream(
      path.join(uploadConfig.directory, fileName),
    );

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: string[][] = [];

    parseCSV.on('data', line => {
      lines.push(line);
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    let transactions: Transaction[] = [];

    console.log('WTFFFFFFFFFFFFFFFFFFFFFFFFFFFF');

    for (let i = 0; i < lines.length; i++) {
      const [title, type, value, category] = lines[i];
      const createTransactionService = new CreateTransactionService();
      const transaction = await createTransactionService.execute({
        title,
        type,
        value: Number(value),
        category,
      });
      transactions.push(transaction);
    }

    return transactions;
  }
}

export default ImportTransactionsService;
