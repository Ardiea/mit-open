// @flow
import { GET, POST, PATCH, INITIAL_STATE } from "redux-hammock/constants"
import R from "ramda"

import { SET_CHANNEL_DATA, CLEAR_CHANNEL_ERROR } from "../actions/channel"
import type { Channel } from "../flow/discussionTypes"
import * as api from "../lib/api"

const updateChannelHandler = (
  payload: Channel,
  data: Map<string, Channel>
): Map<string, Channel> => {
  const update = new Map(data)
  update.set(payload.name, payload)
  return update
}

export const channelsEndpoint = {
  name:                "channels",
  verbs:               [GET, POST, PATCH],
  initialState:        { ...INITIAL_STATE, data: new Map() },
  getFunc:             (name: string) => api.getChannel(name),
  getSuccessHandler:   updateChannelHandler,
  postFunc:            (channel: Channel) => api.createChannel(channel),
  postSuccessHandler:  updateChannelHandler,
  patchFunc:           (channel: Channel) => api.updateChannel(channel),
  patchSuccessHandler: updateChannelHandler,
  extraActions:        {
    [SET_CHANNEL_DATA]: (state, action) => {
      const updatedData = new Map(state.data)
      for (const channel of action.payload) {
        updatedData.set(channel.name, channel)
      }

      return {
        ...state,
        data: updatedData
      }
    },
    [CLEAR_CHANNEL_ERROR]: R.dissoc("error")
  }
}
