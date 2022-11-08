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
    "version": 16,
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
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "MsgClientToServer/CreateRoomReq"
                    }
                },
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "MsgClientToServer/JoinRandomRoomReq"
                    }
                },
                {
                    "id": 2,
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
        "MsgClientToServer/JoinRandomRoomReq": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "kind",
                    "type": {
                        "type": "Literal",
                        "literal": "JoinRandomRoomReq"
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
                    "name": "room_id",
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
                },
                {
                    "id": 1,
                    "name": "room_id",
                    "type": {
                        "type": "Reference",
                        "target": "model/RoomId"
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
                    "id": 0,
                    "name": "user_id",
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
                    "id": 4,
                    "type": {
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
                    "id": 1,
                    "name": "room_id",
                    "type": {
                        "type": "Reference",
                        "target": "model/RoomId"
                    }
                },
                {
                    "id": 3,
                    "name": "user_ids",
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
                }
            ]
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