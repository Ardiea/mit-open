// @flow
import * as api from "../lib/api"
import { GET, POST, PATCH, INITIAL_STATE } from "redux-hammock/constants"

import { SET_POST_DATA } from "../actions/post"

import type { CreatePostPayload, Post } from "../flow/discussionTypes"

const mergePostData = (
  post: Post,
  data: Map<string, Post>
): Map<string, Post> => {
  const update = new Map(data)
  update.set(post.id, post)
  return update
}

const mergeMultiplePosts = (
  posts: Array<Post>,
  data: Map<string, Post>
): Map<string, Post> => {
  const update = new Map(data)
  posts.forEach(post => {
    update.set(post.id, post)
  })
  return update
}

export const postsEndpoint = {
  name:     "posts",
  verbs:    [GET, POST, PATCH],
  getFunc:  (id: string) => api.getPost(id),
  postFunc: (name: string, payload: CreatePostPayload) =>
    api.createPost(name, payload),
  patchFunc:           (id: string, post: Post) => api.editPost(id, post),
  postSuccessHandler:  mergePostData,
  initialState:        { ...INITIAL_STATE, data: new Map() },
  getSuccessHandler:   mergePostData,
  patchSuccessHandler: mergePostData,
  extraActions:        {
    [SET_POST_DATA]: (state, action) => {
      const update =
        action.payload instanceof Array
          ? mergeMultiplePosts(action.payload, state.data)
          : mergePostData(action.payload, state.data)
      return Object.assign({}, state, { data: update, loaded: true })
    }
  }
}
