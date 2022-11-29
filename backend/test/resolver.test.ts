import assert from 'assert';
import { Observable, Subject, from } from 'rxjs';
import { OutGoingMsg } from '../src/lib/connection';
import { FlowOutput, resolve$, translate } from "../src/lib/resolver"
import { Entities, User, UserId } from '../src/lib/store';
import { MsgClientToServer } from '../src/shared/protocols/MsgClientToServer';
import update from 'immutability-helper';
import {io as IO} from "fp-ts"


describe('resolver', function () {
  const mockNow: IO.IO<Date> = IO.of(new Date('04 Dec 1995 00:12:00 GMT'))
  const mockUuid: IO.IO<string> = () => 'someUuid'
  const user1: User = {
    id: 'user1' as UserId,
    status: { type: 'IDLE' }
  }
  const entities: Entities = {
    users: { [user1.id]: user1 },
    teams: {},
    rooms: {},
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
        userIds: [user1.id],
        msg: {
          kind: 'PongRes',
          ts: mockNow()
        }
      },
      newEntities: entities
    }
    assert.deepStrictEqual(output, expected)
  })



})