export const defaultMembers: {[key:string]: {privateKey: string, cert?: string}} = {
    normalUser: {
        privateKey: "e3190337e0efd18c344fb2e1dbfe0066b3a9c44164f8780b0092cbda48cc265e",
    },
    moderator: {
        privateKey: "5b5f7195e837a1ce999337107879f819328fb91acdf574da81358c550c9c1f7d",
    },
    moderatorManaegr: {
        privateKey: "7c2c297c6494f792a6704fe730b60c51692b0c0643296adcf7965c3783def8e1",
    },
    escrow: {
        privateKey: "35eda9d9ca61f4fe6b876445a2e04eed08316e6e4ebdd3a64fb7a6bf9b13e8d8",
    },
    escrowManager: {
        privateKey: "7bb1db456d8d5b26d52f3ee00dc947f346f5c33e34280457c53b923bedb5d435",
    },
    resourceManager: {
        privateKey: "27b7de98f78c661bb70a01483824b3cc9b72f546e8a7081d0e1163d36fbbeb4f",
    },
    seller: {
        privateKey: "e01435d57dce727f22a2dc0097e07f21771b1998ae0a4a4e7f0f3f1104f49bb3",
        cert: '{"created_at":1709622329,"content":"I approved your request, valid for 30 days","tags":[["p","3a37d01fe43ab76809a1c4d4674a70db8477dcf0f39c451778a07ac1d159167d"],["e","42e0b9cb7e57f9f84da1d10b9a36fb5b96b1162085202e0d0fe54913426948ca"]],"kind":9,"pubkey":"6812b4a231dd808cd307fed47ed1b74a64e2583a7046be7fdda933910af1d9b8","id":"d63118a83082e1ef8a19d5c16b53249b77eb0081b160279694e87ea64dcb76d7","sig":"04ee4f91427b73204653decb31afe9158a354d99a72166e7c75116aba879e84dd051df9e21c70b1ace1bc2886e285b8d62821dc4f9981b35ba56add2ce36cf65"}',
    },
    ceo: {
        privateKey: "5ec42c1ed694360ed184f6572b3961bc87559e9461db833d5d403b25143b0c6c",
    }
};