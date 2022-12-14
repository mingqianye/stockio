import { ServiceProto } from 'tsrpc-proto';
import { MsgClientToServer } from './MsgClientToServer';
import { MsgServerToClient } from './MsgServerToClient';

export interface ServiceType {
    api: {

    },
    msg: {
        "ClientToServer": MsgClientToServer,
        "ServerToClient": MsgServerToClient
    }
}

export const serviceProto: ServiceProto<ServiceType> = {
    "version": 26,
    "services": [
        {
            "id": 9,
            "name": "ClientToServer",
            "type": "msg"
        },
        {
            "id": 10,
            "name": "ServerToClient",
            "type": "msg"
        }
    ],
    "types": {
        "MsgClientToServer/MsgClientToServer": {
            "type": "Intersection",
            "members": [
                {
                    "id": 2,
                    "type": {
                        "type": "Reference",
                        "target": "MsgClientToServer/Req"
                    }
                },
                {
                    "id": 3,
                    "type": {
                        "type": "Reference",
                        "target": "MsgClientToServer/BaseClientToServerMessage"
                    }
                }
            ]
        },
        "MsgClientToServer/Req": {
            "type": "Union",
            "members": [
                {
                    "id": 5,
                    "type": {
                        "type": "Reference",
                        "target": "MsgClientToServer/PingReq"
                    }
                },
                {
                    "id": 9,
                    "type": {
                        "type": "Reference",
                        "target": "MsgClientToServer/ConnectReq"
                    }
                },
                {
                    "id": 7,
                    "type": {
                        "type": "Reference",
                        "target": "MsgClientToServer/DisconnectReq"
                    }
                },
                {
                    "id": 10,
                    "type": {
                        "type": "Reference",
                        "target": "MsgClientToServer/CreateRoomReq"
                    }
                },
                {
                    "id": 11,
                    "type": {
                        "type": "Reference",
                        "target": "MsgClientToServer/EnterRoomReq"
                    }
                },
                {
                    "id": 3,
                    "type": {
                        "type": "Reference",
                        "target": "MsgClientToServer/LeaveRoomReq"
                    }
                },
                {
                    "id": 8,
                    "type": {
                        "type": "Reference",
                        "target": "MsgClientToServer/StartGameReq"
                    }
                },
                {
                    "id": 4,
                    "type": {
                        "type": "Reference",
                        "target": "MsgClientToServer/OrderReq"
                    }
                }
            ]
        },
        "MsgClientToServer/PingReq": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "kind",
                    "type": {
                        "type": "Literal",
                        "literal": "PingReq"
                    }
                }
            ]
        },
        "MsgClientToServer/ConnectReq": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "kind",
                    "type": {
                        "type": "Literal",
                        "literal": "ConnectReq"
                    }
                }
            ]
        },
        "MsgClientToServer/DisconnectReq": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "kind",
                    "type": {
                        "type": "Literal",
                        "literal": "DisconnectReq"
                    }
                }
            ]
        },
        "MsgClientToServer/CreateRoomReq": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "kind",
                    "type": {
                        "type": "Literal",
                        "literal": "CreateRoomReq"
                    }
                }
            ]
        },
        "MsgClientToServer/EnterRoomReq": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "kind",
                    "type": {
                        "type": "Literal",
                        "literal": "EnterRoomReq"
                    }
                },
                {
                    "id": 1,
                    "name": "roomId",
                    "type": {
                        "type": "Reference",
                        "target": "model/RoomId"
                    }
                }
            ]
        },
        "model/RoomId": {
            "type": "Reference",
            "target": "model/NonEmptyString"
        },
        "model/NonEmptyString": {
            "type": "String"
        },
        "MsgClientToServer/LeaveRoomReq": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "kind",
                    "type": {
                        "type": "Literal",
                        "literal": "LeaveRoomReq"
                    }
                }
            ]
        },
        "MsgClientToServer/StartGameReq": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "kind",
                    "type": {
                        "type": "Literal",
                        "literal": "StartGameReq"
                    }
                }
            ]
        },
        "MsgClientToServer/OrderReq": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "kind",
                    "type": {
                        "type": "Literal",
                        "literal": "OrderReq"
                    }
                }
            ]
        },
        "MsgClientToServer/BaseClientToServerMessage": {
            "type": "Interface",
            "properties": [
                {
                    "id": 2,
                    "name": "userId",
                    "type": {
                        "type": "Reference",
                        "target": "model/UserId"
                    }
                },
                {
                    "id": 1,
                    "name": "ts",
                    "type": {
                        "type": "Date"
                    }
                }
            ]
        },
        "model/UserId": {
            "type": "Reference",
            "target": "model/NonEmptyString"
        },
        "MsgServerToClient/MsgServerToClient": {
            "type": "Intersection",
            "members": [
                {
                    "id": 6,
                    "type": {
                        "type": "Reference",
                        "target": "MsgServerToClient/Res"
                    }
                },
                {
                    "id": 5,
                    "type": {
                        "type": "Reference",
                        "target": "MsgServerToClient/BaseServerToClientMessage"
                    }
                }
            ]
        },
        "MsgServerToClient/Res": {
            "type": "Union",
            "members": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "MsgServerToClient/PongRes"
                    }
                },
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "MsgServerToClient/RoomDetailRes"
                    }
                },
                {
                    "id": 2,
                    "type": {
                        "type": "Reference",
                        "target": "MsgServerToClient/ServerErrorRes"
                    }
                },
                {
                    "id": 3,
                    "type": {
                        "type": "Reference",
                        "target": "MsgServerToClient/TickRes"
                    }
                }
            ]
        },
        "MsgServerToClient/PongRes": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "kind",
                    "type": {
                        "type": "Literal",
                        "literal": "PongRes"
                    }
                }
            ]
        },
        "MsgServerToClient/RoomDetailRes": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "kind",
                    "type": {
                        "type": "Literal",
                        "literal": "RoomDetailRes"
                    }
                },
                {
                    "id": 5,
                    "name": "roomId",
                    "type": {
                        "type": "Reference",
                        "target": "model/RoomId"
                    }
                },
                {
                    "id": 9,
                    "name": "teams",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "model/Team"
                        }
                    }
                },
                {
                    "id": 8,
                    "name": "status",
                    "type": {
                        "type": "Union",
                        "members": [
                            {
                                "id": 0,
                                "type": {
                                    "type": "Literal",
                                    "literal": "WAITING"
                                }
                            },
                            {
                                "id": 1,
                                "type": {
                                    "type": "Literal",
                                    "literal": "GAME_STARTED"
                                }
                            }
                        ]
                    }
                }
            ]
        },
        "model/Team": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "userIds",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "model/UserId"
                        }
                    }
                }
            ]
        },
        "MsgServerToClient/ServerErrorRes": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "kind",
                    "type": {
                        "type": "Literal",
                        "literal": "ServerErrorRes"
                    }
                },
                {
                    "id": 1,
                    "name": "error",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "MsgServerToClient/TickRes": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "kind",
                    "type": {
                        "type": "Literal",
                        "literal": "TickRes"
                    }
                },
                {
                    "id": 3,
                    "name": "price",
                    "type": {
                        "type": "Reference",
                        "target": "model/Price"
                    }
                },
                {
                    "id": 2,
                    "name": "gameClock",
                    "type": {
                        "type": "Reference",
                        "target": "model/GameClock"
                    }
                }
            ]
        },
        "model/Price": {
            "type": "Reference",
            "target": "model/NonNegativeNumber"
        },
        "model/NonNegativeNumber": {
            "type": "Number"
        },
        "model/GameClock": {
            "type": "Reference",
            "target": "model/NonNegativeNumber"
        },
        "MsgServerToClient/BaseServerToClientMessage": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "ts",
                    "type": {
                        "type": "Date"
                    }
                }
            ]
        }
    }
};