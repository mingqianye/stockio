import assert from 'assert';
import { Observable, Subject, from } from 'rxjs';
import { OutGoingMsg } from '../src/lib/connection';
import { FlowOutput, resolve$, translate } from "../src/lib/resolver"
import { Entities, Room, RoomId, Team, TeamId, User, UserId } from '../src/lib/store';
import { MsgClientToServer } from '../src/shared/protocols/MsgClientToServer';
import update from 'immutability-helper';
import {io as IO} from "fp-ts"


describe('resolver', function () {
  const mockNow: IO.IO<Date> = IO.of(new Date('04 Dec 1995 00:12:00 GMT'))
  const mockUuid: IO.IO<string> = () => 'someUuid'

  const room1: Room = { id: 'room1' as RoomId, status: 'WAITING' }

  const team1: Team = { id: 'team1' as TeamId, status: { type: 'IN_ROOM', roomId: room1.id}}

  const user1: User = { id: 'user1' as UserId, status: { type: 'IN_TEAM', teamId: team1.id } }

  const user2: User = { id: 'user2' as UserId, status: { type: 'IN_TEAM', teamId: team1.id } }

  const user3: User = { id: 'user3' as UserId, status: { type: 'IDLE' } }


  const entities: Entities = {
    users: { 
      [user1.id]: user1,
      [user2.id]: user2,
      [user3.id]: user3,
    },
    teams: {
      [team1.id]: team1
    },
    rooms: {
      [room1.id]: room1
    },
    games: {},
    waitlists: {}
  }

  before(async function() {

  })

  it('connectReqFlow', function () {
    const msg: MsgClientToServer = {
      kind: "ConnectReq",
      userId: "abc" as UserId,
      ts: new Date()
    }
    const output = translate(msg, entities, mockUuid, mockNow)
    const expected: FlowOutput  = {
      outgoingMsg: [],
      newEntities: update(entities, {
        users: {$merge: {
          ["abc" as UserId]: {
            id: "abc" as UserId,
            status: { type: 'IDLE' }
          }
        }}
      })
    }
    assert.deepStrictEqual(output, expected)
  })

  it('pingFlow', function () {
    const msg: MsgClientToServer = {
      kind: "PingReq",
      userId: user1.id,
      ts: new Date()
    }
    const output = translate(msg, entities, mockUuid, mockNow)
    const expected: FlowOutput  = {
      outgoingMsg: {
        userIds: new Set([user1.id]),
        msg: {
          kind: 'PongRes',
          ts: mockNow()
        }
      },
      newEntities: entities
    }
    assert.deepStrictEqual(output, expected)
  })

  it('createRoomFlow', function () {
    const msg: MsgClientToServer = {
      kind: "CreateRoomReq",
      userId: user3.id,
      ts: new Date()
    }
    const output = translate(msg, entities, mockUuid, mockNow)
    const expected: FlowOutput  = {
      outgoingMsg: {
        userIds: new Set([user3.id]),
        msg: {
          kind: 'RoomDetailRes',
          roomId: mockUuid(),
          status: 'WAITING',
          teams: [{userIds: [user3.id]}],
          ts: mockNow()
        }
      },
      newEntities: update(entities, {
        users: {$merge: { [user3.id]: {id: user3.id, status: { type: 'IN_TEAM', teamId: mockUuid() as TeamId}}}},
        rooms: {$merge: { [mockUuid() as RoomId]: { id: mockUuid() as RoomId, status: 'WAITING' } }},
        teams: {$merge: { [mockUuid() as TeamId]: { id: mockUuid() as TeamId, status: {type: 'IN_ROOM', roomId: mockUuid() as RoomId } }}},
      })
    }
    assert.deepStrictEqual(output.newEntities, expected.newEntities)
    assert.deepStrictEqual(output.outgoingMsg, expected.outgoingMsg)
  })

  it('enterRoomFlow', function () {
    const msg: MsgClientToServer = {
      kind: "EnterRoomReq",
      userId: user3.id,
      roomId: room1.id,
      ts: new Date()
    }
    const output = translate(msg, entities, mockUuid, mockNow)
    const expected: FlowOutput  = {
      outgoingMsg: {
        userIds: new Set([user1.id, user2.id, user3.id]),
        msg: {
          kind: 'RoomDetailRes',
          roomId: room1.id,
          status: 'WAITING',
          teams: [{userIds: [user1.id, user2.id]}, {userIds: [user3.id]}],
          ts: mockNow()
        }
      },
      newEntities: update(entities, {
        users: {$merge: { [user3.id]: {id: user3.id, status: { type: 'IN_TEAM', teamId: mockUuid() as TeamId}}}},
        teams: {$merge: { [mockUuid() as TeamId]: { id: mockUuid() as TeamId, status: {type: 'IN_ROOM', roomId: room1.id } }}},
      })
    }
    assert.deepStrictEqual(output.newEntities, expected.newEntities, 'entities do not match.')
    assert.deepStrictEqual(output.outgoingMsg, expected.outgoingMsg, 'outgoingMsgs do not match.')
  })

  it('leaveRoomFlow', function () {
    const msg: MsgClientToServer = {
      kind: "LeaveRoomReq",
      userId: user2.id,
      ts: new Date()
    }
    const output = translate(msg, entities, mockUuid, mockNow)
    const expected: FlowOutput  = {
      outgoingMsg: {
        userIds: new Set([user1.id]),
        msg: {
          kind: 'RoomDetailRes',
          roomId: room1.id,
          status: 'WAITING',
          teams: [{userIds: [user1.id]}],
          ts: mockNow()
        }
      },
      newEntities: update(entities, {
        users: {$merge: { [user2.id]: {id: user2.id, status: { type: 'IDLE' }}}},
      })
    }
    assert.deepStrictEqual(output.newEntities, expected.newEntities, 'entities do not match.')
    assert.deepStrictEqual(output.outgoingMsg, expected.outgoingMsg, 'outgoingMsgs do not match.')
  })

})