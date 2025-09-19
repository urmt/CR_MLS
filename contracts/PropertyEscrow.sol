// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PropertyEscrow is Ownable {
    address public constant USDC_ADDRESS = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174; // Polygon Mainnet
    address public fiatConverter;
    uint256 public listingFee = 5 * 10**6; // 5 USDC (6 decimals)
    
    mapping(string => bool) public paidListings;
    
    event PaymentProcessed(string propertyCID, address payer, bool isCrypto);
    
    constructor() {
        fiatConverter = msg.sender;
    }
    
    function updateFiatConverter(address _converter) external onlyOwner {
        fiatConverter = _converter;
    }
    
    // For crypto payments
    function payWithCrypto(string memory propertyCID) external {
        IERC20(USDC_ADDRESS).transferFrom(msg.sender, owner(), listingFee);
        paidListings[propertyCID] = true;
        emit PaymentProcessed(propertyCID, msg.sender, true);
    }
    
    // For fiat payments (called by backend)
    function payWithFiat(string memory propertyCID) external {
        require(msg.sender == fiatConverter, "Unauthorized");
        paidListings[propertyCID] = true;
        emit PaymentProcessed(propertyCID, address(0), false);
    }
}
