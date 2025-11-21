export interface BankDetails {
    routingNumber: string;
    accountNumber: string;
    bankAddress: string;
    customerService: string;
    swiftCode: string;
    iban: string;
}

export const MOCK_BANK_DETAILS: Record<string, BankDetails> = {
    'chase_001': {
        routingNumber: '021000021',
        accountNumber: '1234567890',
        bankAddress: '270 Park Avenue, New York, NY 10017',
        customerService: '1-800-935-9935',
        swiftCode: 'CHASUS33',
        iban: 'US29CHAS0210000211234567890'
    },
    'bofa_001': {
        routingNumber: '026009593',
        accountNumber: '0987654321',
        bankAddress: '100 North Tryon Street, Charlotte, NC 28255',
        customerService: '1-800-432-1000',
        swiftCode: 'BOFAUS3N',
        iban: 'US29BOFA0260095930987654321'
    },
    'wells_001': {
        routingNumber: '121000248',
        accountNumber: '1122334455',
        bankAddress: '420 Montgomery Street, San Francisco, CA 94104',
        customerService: '1-800-869-3557',
        swiftCode: 'WFCUS6S',
        iban: 'US29WFC1210002481122334455'
    },
    'citi_001': {
        routingNumber: '021000089',
        accountNumber: '5566778899',
        bankAddress: '388 Greenwich Street, New York, NY 10013',
        customerService: '1-800-374-9700',
        swiftCode: 'CITIUS33',
        iban: 'US29CITI0210000895566778899'
    },
    'usbank_001': {
        routingNumber: '091000022',
        accountNumber: '9988776655',
        bankAddress: '800 Nicollet Mall, Minneapolis, MN 55402',
        customerService: '1-800-872-2657',
        swiftCode: 'USBKUS44',
        iban: 'US29USBK0910000229988776655'
    }
};

export function getMockBankDetails(institutionId: string): BankDetails {
    return MOCK_BANK_DETAILS[institutionId] || MOCK_BANK_DETAILS['chase_001'];
}
