// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/governance/Governor.sol";
import "openzeppelin-contracts/contracts/governance/extensions/GovernorCountingSimple.sol";
import "openzeppelin-contracts/contracts/governance/extensions/GovernorVotes.sol";
import "openzeppelin-contracts/contracts/governance/extensions/GovernorTimelockControl.sol";

contract MyGovernor is
    Governor,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorTimelockControl
{
    constructor(
        IVotes token,
        TimelockController timelock
    )
        Governor("MyGovernor")
        GovernorVotes(token)
        GovernorTimelockControl(timelock)
    {}

    // =========================
    // CORE PARAMS (inlined → smaller than Settings)
    // =========================

    function votingDelay() public pure override returns (uint256) {
        return 1 days;
    }

    function votingPeriod() public pure override returns (uint256) {
        return 7 days;
    }

    function proposalThreshold() public pure override returns (uint256) {
        return 1 ether;
    }

    function quorum(uint256) public pure override returns (uint256) {
        return 4e16; // 4%
    }

    // =========================
    // TIMELock REQUIRED OVERRIDES
    // =========================

    function state(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return GovernorTimelockControl.state(proposalId);
    }

    function proposalNeedsQueuing(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (bool)
    {
        return GovernorTimelockControl.proposalNeedsQueuing(proposalId);
    }

    function _queueOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    )
        internal
        override(Governor, GovernorTimelockControl)
        returns (uint48)
    {
        return GovernorTimelockControl._queueOperations(
            proposalId,
            targets,
            values,
            calldatas,
            descriptionHash
        );
    }

    function _executeOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    )
        internal
        override(Governor, GovernorTimelockControl)
    {
        GovernorTimelockControl._executeOperations(
            proposalId,
            targets,
            values,
            calldatas,
            descriptionHash
        );
    }

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    )
        internal
        override(Governor, GovernorTimelockControl)
        returns (uint256)
    {
        return GovernorTimelockControl._cancel(
            targets,
            values,
            calldatas,
            descriptionHash
        );
    }

    function _executor()
        internal
        view
        override(Governor, GovernorTimelockControl)
        returns (address)
    {
        return GovernorTimelockControl._executor();
    }
}