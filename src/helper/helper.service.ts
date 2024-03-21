import { Injectable,Inject } from '@nestjs/common';
import { createCipheriv, randomBytes, scrypt, createDecipheriv } from 'crypto';
import { promisify } from 'util';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import axios from 'axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { JwtPayload ,decode} from 'jsonwebtoken'
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
 

// const secret = "secret"
const secret = process.env.HASH_SECRET
let key = crypto.createHash('sha256').update(String(secret)).digest('base64').substr(0, 32);

 
const iv = crypto.randomBytes(16);


@Injectable()
export class HelperService {
  constructor(private config: ConfigService,
    @Inject(CACHE_MANAGER) private cacheService: Cache,) {}

  
   
  async encrypt(text) {
      let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
      let encrypted = cipher.update(text);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      return { iv: iv.toString('hex'),
      encryptedData: encrypted.toString('hex') };
  }
   
 
   
  async decrypt(password,ivm) {
      let iv = Buffer.from(ivm, 'hex');
     
      let encryptedText = Buffer.from(password, 'hex');
      
   
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

 async accessToken(token:string | null){
    const decodedToken = decode(token) as JwtPayload;
    const currentTime = Math.floor(Date.now() / 1000); 
    if (!decodedToken || decodedToken.exp < currentTime ) {
      console.log("expired")
      const email = this.config.get("ERICAS_EMAIL")
      const password = this.config.get("ERICAS_PASSWORD")
      const data ={email,password}
      const url = this.config.get("LOGIN_URL")
      const response = await axios.post(url, data);
      const newToken =response.data.data.token.access_token
      await this.cacheService.set("token",newToken)
      return newToken

    } else {
     console.log("redis")
      return token
    }

  }

   randomlyRedact(inputString:string) {
    const characters = inputString.match(/[a-zA-Z0-9]/g);
   
      const indices = [];
      while (indices.length < 2) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        if (!indices.includes(randomIndex)) {
          indices.push(randomIndex);
        }
      }
  
      const redactedString = inputString.split('');
      indices.forEach(index => {
        redactedString[redactedString.indexOf(characters[index])] = '*';
      });
  
      return redactedString.join('');
   
  }

  replaceAsterisks(redactedResult1, userResponse) {
    
    const userResponseArray = userResponse.split('');
  
    let currentIndex = 0;
    const replacedNumber = redactedResult1.replace(/\*/g, () => userResponseArray[currentIndex++]);
  
    return replacedNumber;
  }

   generateTransactionReference() {
    const timestamp = new Date().getTime(); 
    const randomString = Math.random().toString(36).substring(2, 15); 
    const transactionReference = `TRX-${randomString}`;

    return transactionReference;
}
}

