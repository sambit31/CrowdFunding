//SPDX-License-Identifier:MIT
pragma solidity ^0.8.26;

contract CrowdFunding {
    struct Request {
        string description;
        address payable recipient;
        uint value;
        bool completed;
        uint noofVoters;
        mapping(address=>bool) voters;
    }

    mapping(address=>uint) public contributors;
    mapping(uint=>Request) public requests;
    uint public numRequests;
    address public manager;
    uint public minimumContribution;
    uint public deadline;
    uint public target;
    uint public noOfContributors;
    uint public raisedAmount;

    // Events for tracking contract activity
    event ContributionReceived(address contributor, uint amount);
    event RefundIssued(address contributor, uint amount);
    event RequestCreated(uint requestId, string description, address recipient, uint value);
    event VoteCast(uint requestId, address voter);
    event PaymentExecuted(uint requestId, address recipient, uint value);

    constructor(uint _target, uint _deadline) {
        target = _target;
        deadline = block.timestamp + _deadline;
        minimumContribution = 100 wei;
        manager = msg.sender;
    }

    modifier onlyManager() {
        require(msg.sender == manager, "You are not the manager");
        _;
    }

    function createRequests(string calldata _description, address payable _recipient, uint _value) public onlyManager {
        Request storage newRequest = requests[numRequests];

        newRequest.description = _description;
        newRequest.recipient = _recipient;
        newRequest.value = _value;
        newRequest.completed = false;
        newRequest.noofVoters = 0;

        emit RequestCreated(numRequests, _description, _recipient, _value);
        numRequests++;
    }

    function contribution() public payable {
        require(block.timestamp < deadline, "Deadline has passed");
        require(msg.value >= minimumContribution, "Minimum contibution required is 100 wei");

        if(contributors[msg.sender] == 0) {
            noOfContributors++;
        }
        contributors[msg.sender] += msg.value;
        raisedAmount += msg.value;
        
        emit ContributionReceived(msg.sender, msg.value);
    }

    function getContractBalance() public view returns(uint) {
        return address(this).balance;
    }

    function refund() public {
        require(block.timestamp > deadline && raisedAmount < target, "You are not eligible for refund");
        require(contributors[msg.sender] > 0, "You are not a contributor"); 

        uint amount = contributors[msg.sender];
        contributors[msg.sender] = 0; // Update state before transfer to prevent reentrancy
        
        payable(msg.sender).transfer(amount);
        emit RefundIssued(msg.sender, amount);
    }

    function voteRequest(uint _requestNo) public {
        require(contributors[msg.sender] > 0, "Must be a contributor to vote");
        require(_requestNo < numRequests, "Request does not exist");
        
        Request storage thisRequest = requests[_requestNo];
        require(thisRequest.voters[msg.sender] == false, "You have already voted");

        thisRequest.voters[msg.sender] = true;
        thisRequest.noofVoters++;
        
        emit VoteCast(_requestNo, msg.sender);
    }

    function makePayment(uint _requestNo) public onlyManager {
        // Validate request exists
        require(_requestNo < numRequests, "Request does not exist");
        
        // Add deadline validation
        require(block.timestamp > deadline, "Deadline has not passed yet");
        require(raisedAmount >= target, "Target not reached, cannot make payment");
        
        Request storage thisRequest = requests[_requestNo];
        require(thisRequest.completed == false, "Request already completed");
        require(thisRequest.noofVoters > noOfContributors / 2, "Not enough approvals");
        
        // Validate sufficient funds
        require(address(this).balance >= thisRequest.value, "Insufficient contract balance");
        
        // Mark as completed before transfer to prevent reentrancy
        thisRequest.completed = true;
        
        // Transfer funds
        thisRequest.recipient.transfer(thisRequest.value);
        
        emit PaymentExecuted(_requestNo, thisRequest.recipient, thisRequest.value);
    }
}