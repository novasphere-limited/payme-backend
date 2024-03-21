export enum keyword {
  Register = 'Register',
  Confirm = 'Confirm',
  Send = 'Send',
  Exit = 'Exit',
}

export const banks = {
  ab: {
    cbn_code: '755',
    bank_name: 'AB MicroFinance Bank',
  },
  access: {
    cbn_code: '044',
    bank_name: 'Access Bank plc',
  },

  diamond: {
    cbn_code: '063',
    bank_name: 'Diamond Bank',
  },
  ecobank: {
    cbn_code: '050',
    bank_name: 'ECOBANK',
  },

  fbnmobile: {
    cbn_code: 'B83',
    bank_name: 'FBNMobile',
  },

  fbn: {
    cbn_code: '011',
    bank_name: 'FIRSTBANK',
  },

  fidelity: {
    cbn_code: '070',
    bank_name: 'Fidelity Bank',
  },

  fcmb: {
    cbn_code: '214',
    bank_name: 'First City Monument Bank Plc',
  },

  fw: {
    cbn_code: 'C19',
    bank_name: 'Flutterwave',
  },

  gtb: {
    cbn_code: '058',
    bank_name: 'Guaranty Trust Bank PLC',
  },

  heritage: {
    cbn_code: '030',
    bank_name: 'Heritage Bank',
  },

  keystone: {
    cbn_code: '082',
    bank_name: 'Keystone Bank',
  },

  konga: {
    cbn_code: 'B92',
    bank_name: 'KongaPay',
  },

  kuda: {
    cbn_code: 'A98',
    bank_name: 'Kuda Microfinance Bank',
  },
 
  lapo: {
    cbn_code: 'B01',
    bank_name: 'LAPO MFB',
  },

  pb: {
    cbn_code: 'B24',
    bank_name: 'New Prudential Bank',
  },

  opay: {
    cbn_code: 'B97',
    bank_name: 'OPAY',
  },

  providus: {
    cbn_code: '101',
    bank_name: 'PROVIDUS Bank',
  },
  
  paga: {
    cbn_code: 'B98',
    bank_name: 'Paga',
  },
  page: {
    cbn_code: 'B35',
    bank_name: 'Page Microfinance Bank',
  },
  palmpay: {
    cbn_code: 'B99',
    bank_name: 'Palmpay',
  },

  payattitude: {
    cbn_code: 'C02',
    bank_name: 'PayAttitude Online',
  },
  paycom: {
    cbn_code: 'C03',
    bank_name: 'Paycom',
  },
  paystack: {
    cbn_code: 'C28',
    bank_name: 'Paystack',
  },

  pennywise: {
    cbn_code: 'B38',
    bank_name: 'Pennywise MFB',
  },

  platinum: {
    cbn_code: 'B42',
    bank_name: 'Platinum Mortgage Bank',
  },
  pocketmoni: {
    cbn_code: '700',
    bank_name: 'PocketMoni',
  },

  prestige: {
    cbn_code: 'B43',
    bank_name: 'Prestige Microfinance Bank',
  },
  purple: {
    cbn_code: 'B44',
    bank_name: 'Purplemoney MFB',
  },

  regent: {
    cbn_code: 'B48',
    bank_name: 'Regent Microfinance Bank',
  },
  reliance: {
    cbn_code: 'B49',
    bank_name: 'Reliance MFB',
  },
  renmoney: {
    cbn_code: 'B50',
    bank_name: 'Renmoney MFB',
  },

  stanbic: {
    cbn_code: '039',
    bank_name: 'STANBIC IBTC Bank',
  },
  scb: {
    cbn_code: '068',
    bank_name: 'STandard Chartered Bank',
  },

  skye: {
    cbn_code: '076',
    bank_name: 'Skye Bank Plc',
  },

  sterling: {
    cbn_code: '232',
    bank_name: 'Sterling Bank',
  },

  taj: {
    cbn_code: '302',
    bank_name: 'TAJ Bank',
  },
  tagpay: {
    cbn_code: 'C06',
    bank_name: 'TagPay',
  },

  ubn: {
    cbn_code: '032',
    bank_name: 'Union Bank of Nigeria',
  },
  uba: {
    cbn_code: '033',
    bank_name: 'United Bank for Africa',
  },
  unity: {
    cbn_code: '215',
    bank_name: 'Unity Bank PLC',
  },

  wema: {
    cbn_code: '035',
    bank_name: 'WEMA',
  },

  zenith: {
    cbn_code: '057',
    bank_name: 'Zenith Bank Plc.',
  },

  etranzact: {
    cbn_code: 'B82',
    bank_name: 'eTranzact',
  },
}

export const airtime = {
  mtn:{
    network:"MTN",
    service:"MTNVTU",
  },
  glo:{
    network:"GLO",
    service:"GLOVTU",
  },
  airtel:{
    network:"AIRTEL",
    service:"AIRTELVTU",
  },
  "9mobile":{
    network:"9MOBILE",
    service:"9MOBILEVTU",
  }

}

export const electricityBillers = {
 
 

    joselectric:{
      type: "jos_electric_prepaid",
      id: 2,
      narration: "Jos Prepaid",
      product_id: 3,
      short_name: "jos electric prepaid",
      image: "https://sagecloud.ng/assets/images/billers/capricorn/jos_electric.webp",
      disco:"JOS"
    },
    kadunaelectric:{
      type: "kaduna_electric_prepaid",
      id: 3,
      narration: "Kaduna Prepaid",
      product_id: 5,
      short_name: "kaduna electric prepaid",
      image: "https://sagecloud.ng/assets/images/billers/capricorn/elect.webp",
      disco:"KADUNA"
    },
    ekoelectric:{
      type: "eko_electric_prepaid",
      id: 5,
      narration: "Eko Prepaid",
      product_id: 11,
      short_name: "eko electric prepaid",
      image: "https://sagecloud.ng/assets/images/billers/capricorn/eko_electric.webp",
      disco:"EKO"
    },
    ibadanelectric:{
      type: "ibadan_electric_prepaid",
      id: 6,
      narration: "Ibadan Disco Prepaid (Fets Wallet)",
      product_id: 12,
      short_name: "ibadan electric prepaid",
      image: "https://sagecloud.ng/assets/images/billers/capricorn/ibadan_electric.webp",
      disco:"IBADAN"
    },
    // {
    //   "type": "portharcourt_electric_postpaid",
    //   "id": 7,
    //   "narration": "Port Harcourt Postpaid (Xpresspayments)",
    //   "product_id": 13,
    //   "short_name": "portharcourt electric postpaid",
    //   "image": "https://sagecloud.ng/assets/images/billers/capricorn/portharcourt_electric.webp"
    // },
    portharcourtelectric:{
      type: "portharcourt_electric_prepaid",
      id: 7,
      narration: "Port Harcourt Prepaid (Xpresspayments)",
      product_id: 14,
      short_name: "portharcourt electric prepaid",
      image: "https://sagecloud.ng/assets/images/billers/capricorn/portharcourt_electric.webp",
      disco:"PORTHARCOURT"
    },
    // {
    //   "type": "enugu_electric_postpaid",
    //   "id": 8,
    //   "narration": "Enugu Postpaid",
    //   "product_id": 15,
    //   "short_name": "enugu electric postpaid",
    //   "image": "https://sagecloud.ng/assets/images/billers/capricorn/enugu_electric.webp"
    // },
    enuguelectric:{
      type: "enugu_electric_prepaid",
      id: 8,
      narration: "Enugu Prepaid",
      product_id: 16,
      short_name: "enugu electric prepaid",
      image: "https://sagecloud.ng/assets/images/billers/capricorn/enugu_electric.webp",
      disco:"ENUGU"
    },
    // {
    //   "type": "abuja_electric_postpaid",
    //   "id": 9,
    //   "narration": "Abuja Postpaid",
    //   "product_id": 17,
    //   "short_name": "abuja electric postpaid",
    //   "image": "https://sagecloud.ng/assets/images/billers/capricorn/abuja_electric.webp"
    // },
    abujaelectric:{
      type: "abuja_electric_prepaid",
      id: 9,
      narration: "Abuja Prepaid",
      product_id: 18,
      short_name: "abuja electric prepaid",
      image: "https://sagecloud.ng/assets/images/billers/capricorn/abuja_electric.webp",
      disco:"ABUJA"
    },
    // {
    //   "type": "kedco_electric_postpaid",
    //   "id": 10,
    //   "narration": "Kano Postpaid",
    //   "product_id": 21,
    //   "short_name": "kedco electric postpaid",
    //   "image": "https://sagecloud.ng/assets/images/billers/capricorn/kedco_electric.webp"
    // },
    kedcoelectric:{
      type: "kedco_electric_prepaid",
      id: 10,
      narration: "Kano Prepaid",
      product_id: 22,
      short_name: "kedco electric prepaid",
      image: "https://sagecloud.ng/assets/images/billers/capricorn/kedco_electric.webp",
      disco:"KANO"
    },
    ikejaelectric:{
      type: "ikeja_electric_prepaid",
      id: 4,
      narration: "Ikeja Disco Token Vending (Prepaid)",
      product_id: 25,
      short_name: "ikeja electric prepaid",
      image: "https://sagecloud.ng/assets/images/billers/capricorn/ikeja_electric.webp",
      disco:"IKEDC"
    },
    // {
    //   "type": "ikeja_electric_postpaid",
    //   "id": 4,
    //   "narration": "Ikeja Disco Bill Payment (Postpaid)",
    //   "product_id": 26,
    //   "short_name": "ikeja electric postpaid",
    //   "image": "https://sagecloud.ng/assets/images/billers/capricorn/ikeja_electric.webp"
    // },
    // {
    //   "type": "eko_electric_postpaid",
    //   "id": 5,
    //   "narration": "Eko Postpaid",
    //   "product_id": 27,
    //   "short_name": "eko electric postpaid",
    //   "image": "https://sagecloud.ng/assets/images/billers/capricorn/eko_electric.webp"
    // },
    // {
    //   "type": "ibadan_electric_postpaid",
    //   "id": 6,
    //   "narration": "Ibadan Disco Postpaid (Fets Wallet)",
    //   "product_id": 44,
    //   "short_name": "ibadan electric postpaid",
    //   "image": "https://sagecloud.ng/assets/images/billers/capricorn/ibadan_electric.webp"
    // }

}
