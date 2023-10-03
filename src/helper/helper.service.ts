import { Injectable } from '@nestjs/common';
import { createCipheriv, randomBytes, scrypt, createDecipheriv } from 'crypto';
import { promisify } from 'util';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
 
const key = crypto.randomBytes(32);
 
const iv = crypto.randomBytes(16);

@Injectable()
export class HelperService {
  constructor(private config: ConfigService) {}

  
   
  async encrypt(text) {
      let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
      let encrypted = cipher.update(text);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      return { iv: iv.toString('hex'),
      encryptedData: encrypted.toString('hex') };
  }
   
 
   
  async decrypt(text) {
      let iv = Buffer.from(text.iv, 'hex');
      let encryptedText = Buffer.from(text.encryptedData, 'hex');
   
      let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
   
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
   
      return decrypted.toString();
  }

  generateOTP(length:number) {
    return Math.floor(10 ** (length - 1) + Math.random() * (10 ** length - 10 ** (length - 1) - 1));
  }

  currentTime(){
    return moment().format('YYYY-MM-DD HH:mm:ss');
  }
}

