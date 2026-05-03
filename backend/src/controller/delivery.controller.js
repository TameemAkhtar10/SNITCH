const pinCodeDeliveryMap = [
    { prefixes: ['11', '12', '13'], days: [2, 4], region: 'North India' },
    { prefixes: ['14', '15', '16', '17'], days: [3, 5], region: 'North-West India' },
    { prefixes: ['18', '19', '20', '21', '22'], days: [3, 6], region: 'North and Central India' },
    { prefixes: ['23', '24', '25', '26', '27', '28'], days: [4, 6], region: 'Central India' },
    { prefixes: ['30', '31', '32', '33', '34'], days: [3, 5], region: 'West India' },
    { prefixes: ['36', '37', '38', '39'], days: [4, 6], region: 'West and South-West India' },
    { prefixes: ['40', '41', '42', '43', '44'], days: [2, 5], region: 'West and South India' },
    { prefixes: ['45', '46', '47', '48', '49'], days: [3, 6], region: 'Central and West India' },
    { prefixes: ['50', '51', '52', '53'], days: [2, 4], region: 'South India' },
    { prefixes: ['56', '57', '58', '59'], days: [2, 4], region: 'South India' },
    { prefixes: ['60', '61', '62', '63', '64', '65'], days: [3, 5], region: 'South India' },
    { prefixes: ['66', '67', '68', '69'], days: [4, 6], region: 'South-East India' },
    { prefixes: ['70', '71', '72', '73', '74'], days: [2, 4], region: 'East India' },
    { prefixes: ['75', '76', '77', '78', '79'], days: [3, 5], region: 'East and North-East India' },
    { prefixes: ['80', '81', '82', '83', '84', '85'], days: [4, 6], region: 'East and North-East India' },
    { prefixes: ['86', '87', '88', '89'], days: [4, 7], region: 'East and North-East India' },
    { prefixes: ['90', '91', '92', '93', '94', '95', '96', '97', '98', '99'], days: [5, 8], region: 'Remote and Special Circles' }
];

export const checkDeliveryByPincode = async (req, res) => {
    try {
        const { pincode } = req.params;

        if (!/^[1-9][0-9]{5}$/.test(pincode)) {
            return res.status(400).json({ success: false, message: 'Invalid Indian pincode', data: {} });
        }

        const prefix = pincode.slice(0, 2);
        const matchedZone = pinCodeDeliveryMap.find((zone) => zone.prefixes.includes(prefix));
        const deliveryDays = matchedZone ? matchedZone.days : [4, 7];

        return res.status(200).json({
            success: true,
            message: 'Delivery estimate fetched successfully',
            pincode,
            region: matchedZone ? matchedZone.region : 'India',
            estimatedDeliveryDays: `${deliveryDays[0]}-${deliveryDays[1]} days`,
            data: { pincode, region: matchedZone ? matchedZone.region : 'India', estimatedDeliveryDays: `${deliveryDays[0]}-${deliveryDays[1]} days` }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Internal server error', data: {} });
    }
};