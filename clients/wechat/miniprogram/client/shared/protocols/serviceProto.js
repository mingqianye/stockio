"use strict";
exports.__esModule = true;
exports.serviceProto = void 0;
exports.serviceProto = {
    "version": 12,
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
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "model/BaseClientToServerMessage"
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
        "model/BaseClientToServerMessage": {
            "type": "Interface",
            "properties": [
                {
                    "id": 1,
                    "name": "user_id",
                    "type": {
                        "type": "Reference",
                        "target": "model/UserId"
                    }
                },
                {
                    "id": 0,
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
                    "id": 2,
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
                                    "target": "MsgServerToClient/TickRes"
                                }
                            },
                            {
                                "id": 2,
                                "type": {
                                    "type": "Reference",
                                    "target": "MsgServerToClient/RoomDetailRes"
                                }
                            }
                        ]
                    }
                },
                {
                    "id": 1,
                    "type": {
                        "type": "Reference",
                        "target": "model/BaseServerToClientMessage"
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
                }
            ]
        },
        "model/BaseServerToClientMessage": {
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
