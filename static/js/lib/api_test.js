/* global SETTINGS: false */
import { assert } from "chai"
import sinon from "sinon"
import qs from "query-string"
import { PATCH, POST, DELETE } from "redux-hammock/constants"
import * as fetchFuncs from "redux-hammock/django_csrf_fetch"
import R from "ramda"

import {
  createChannel,
  getChannel,
  getChannels,
  getFrontpage,
  getPost,
  getPostsForChannel,
  getComments,
  getComment,
  createComment,
  createPost,
  updateComment,
  editPost,
  getMoreComments,
  updateChannel,
  updateRemoved,
  deletePost,
  deleteComment,
  reportContent
} from "./api"
import { makeChannel, makeChannelList } from "../factories/channels"
import { makeChannelPostList, makePost } from "../factories/posts"
import {
  makeCommentsResponse,
  makeMoreCommentsResponse
} from "../factories/comments"

describe("api", function() {
  this.timeout(5000) // eslint-disable-line no-invalid-this

  let sandbox
  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })
  afterEach(function() {
    sandbox.restore()

    for (const cookie of document.cookie.split(";")) {
      const key = cookie.split("=")[0].trim()
      document.cookie = `${key}=`
    }
  })

  describe("REST functions", () => {
    let fetchJSONStub, fetchStub
    beforeEach(() => {
      fetchJSONStub = sandbox.stub(fetchFuncs, "fetchJSONWithCSRF")
      fetchStub = sandbox.stub(fetchFuncs, "fetchWithCSRF")
    })

    it("gets channel posts", async () => {
      const posts = makeChannelPostList()
      fetchJSONStub.returns(Promise.resolve({ posts }))

      const result = await getPostsForChannel("channelone", {})
      assert.ok(fetchJSONStub.calledWith("/api/v0/channels/channelone/posts/"))
      assert.deepEqual(result.posts, posts)
    })

    it("gets channel posts with pagination params", async () => {
      const posts = makeChannelPostList()
      fetchJSONStub.returns(Promise.resolve({ posts }))

      const result = await getPostsForChannel("channelone", {
        before: "abc",
        after:  "def",
        count:  5
      })
      assert.ok(
        fetchJSONStub.calledWith(
          `/api/v0/channels/channelone/posts/?after=def&before=abc&count=5`
        )
      )
      assert.deepEqual(result.posts, posts)
    })

    it("gets channel", async () => {
      const channel = makeChannel()
      fetchJSONStub.returns(Promise.resolve(channel))

      const result = await getChannel("channelone")
      assert.ok(fetchJSONStub.calledWith("/api/v0/channels/channelone/"))
      assert.deepEqual(result, channel)
    })

    it("gets a list of channels", async () => {
      const channelList = makeChannelList()
      fetchJSONStub.returns(Promise.resolve(channelList))

      const result = await getChannels()
      assert.ok(fetchJSONStub.calledWith("/api/v0/channels/"))
      assert.deepEqual(result, channelList)
    })

    it("creates a channel", async () => {
      const channel = makeChannel()
      fetchJSONStub.returns(Promise.resolve(channel))

      const input = {
        name:               "name",
        title:              "title",
        description:        "description",
        public_description: "public_description",
        channel_type:       "public"
      }

      const result = await createChannel(input)
      assert.ok(
        fetchJSONStub.calledWith(`/api/v0/channels/`, {
          method: POST,
          body:   JSON.stringify({
            ...input
          })
        })
      )
      assert.deepEqual(result, channel)
    })

    it("updates a channel", async () => {
      const channel = makeChannel()
      fetchJSONStub.returns(Promise.resolve(channel))

      const input = {
        name:               "name",
        title:              "title",
        description:        "description",
        public_description: "public_description",
        channel_type:       "public"
      }

      const result = await updateChannel(input)
      assert.ok(
        fetchJSONStub.calledWith(`/api/v0/channels/${input.name}/`, {
          method: PATCH,
          body:   JSON.stringify({
            title:              input.title,
            description:        input.description,
            public_description: input.public_description,
            channel_type:       input.channel_type
          })
        })
      )
      assert.deepEqual(result, channel)
    })

    it("creates a post", async () => {
      const post = makePost()
      fetchJSONStub.returns(Promise.resolve(post))

      const text = "Text"
      const title = "Title"
      const url = "URL"
      const result = await createPost("channelname", { text, title, url })
      const body = JSON.stringify({ url, text, title })
      sinon.assert.calledWith(
        fetchJSONStub,
        "/api/v0/channels/channelname/posts/",
        {
          body,
          method: POST
        }
      )
      assert.deepEqual(result, post)
    })

    it("gets post", async () => {
      const post = makePost()
      fetchJSONStub.returns(Promise.resolve(post))

      const result = await getPost("1")
      assert.ok(fetchJSONStub.calledWith(`/api/v0/posts/1/`))
      assert.deepEqual(result, post)
    })

    it("deletes a post", async () => {
      const post = makePost()
      fetchStub.returns(Promise.resolve())

      await deletePost(post.id)
      assert.ok(fetchStub.calledWith(`/api/v0/posts/${post.id}/`))
    })

    it("gets the frontpage", async () => {
      const posts = makeChannelPostList()
      fetchJSONStub.returns(Promise.resolve({ posts }))

      const result = await getFrontpage({})
      assert.ok(fetchJSONStub.calledWith(`/api/v0/frontpage/`))
      assert.deepEqual(result.posts, posts)
    })

    it("gets the frontpage with pagination params", async () => {
      const posts = makeChannelPostList()
      fetchJSONStub.returns(Promise.resolve({ posts }))

      const result = await getFrontpage({
        before: "abc",
        after:  "def",
        count:  5
      })
      assert.ok(
        fetchJSONStub.calledWith(
          `/api/v0/frontpage/?after=def&before=abc&count=5`
        )
      )
      assert.deepEqual(result.posts, posts)
    })

    it("gets comments for a post", async () => {
      const post = makePost()
      const response = makeCommentsResponse(post)
      fetchJSONStub.returns(Promise.resolve(response))

      const resp = await getComments(post.id)
      assert.deepEqual(resp, response)
    })

    it("gets a single comment", async () => {
      const post = makePost()
      const response = R.slice(0, 1, makeCommentsResponse(post))
      fetchJSONStub.returns(response)

      const resp = await getComment(post.id)
      assert.deepEqual(resp, response)
    })

    it("creates comments for a post", async () => {
      const post = makePost()
      fetchJSONStub.returns(Promise.resolve())

      await createComment(post.id, "my new comment")
      assert.ok(fetchJSONStub.calledWith(`/api/v0/posts/${post.id}/comments/`))
      assert.deepEqual(fetchJSONStub.args[0][1], {
        method: POST,
        body:   JSON.stringify({ text: "my new comment" })
      })
    })

    it("creates comments replying to comments", async () => {
      const post = makePost()
      const tree = makeCommentsResponse(post)
      fetchJSONStub.returns(Promise.resolve())

      await createComment(post.id, "my new comment", tree[0].id)
      assert.ok(fetchJSONStub.calledWith(`/api/v0/posts/${post.id}/comments/`))
      assert.deepEqual(fetchJSONStub.args[0][1], {
        method: POST,
        body:   JSON.stringify({
          text:       "my new comment",
          comment_id: tree[0].id
        })
      })
    })

    it("updates a comment", async () => {
      const post = makePost()
      const tree = makeCommentsResponse(post)
      const comment = tree[0]
      const commentResponse = { ...comment, replies: undefined, text: "edited" }

      fetchJSONStub.returns(Promise.resolve(commentResponse))

      const payload = {
        text:      "edited",
        downvoted: true
      }
      const updated = await updateComment(comment.id, payload)
      assert.ok(fetchJSONStub.calledWith(`/api/v0/comments/${comment.id}/`))
      assert.deepEqual(updated, commentResponse)
      assert.deepEqual(fetchJSONStub.args[0][1], {
        method: PATCH,
        body:   JSON.stringify(payload)
      })
    })

    it("deletes a comment", async () => {
      const comment = makeCommentsResponse(makePost())[0]
      fetchStub.returns(Promise.resolve())

      await deleteComment(comment.id)
      assert.ok(
        fetchStub.calledWith(`/api/v0/comments/${comment.id}/`, {
          method: DELETE
        })
      )
    })

    it("updates a post", async () => {
      const post = makePost()

      fetchJSONStub.returns(Promise.resolve())

      post.text = "updated!"

      await editPost(post.id, post)

      assert.ok(fetchJSONStub.calledWith(`/api/v0/posts/${post.id}/`))
      assert.deepEqual(fetchJSONStub.args[0][1], {
        method: PATCH,
        body:   JSON.stringify(R.dissoc("url", post))
      })
    })
    ;[true, false].forEach(status => {
      it(`updates post removed: ${status}`, async () => {
        const post = makePost()

        fetchJSONStub.returns(Promise.resolve())

        await updateRemoved(post.id, status)

        assert.ok(fetchJSONStub.calledWith(`/api/v0/posts/${post.id}/`))
        assert.deepEqual(fetchJSONStub.args[0][1], {
          method: PATCH,
          body:   JSON.stringify({
            removed: status
          })
        })
      })
    })

    describe("retrieves more comments", () => {
      it("at the root level", async () => {
        const post = makePost()
        const moreComments = makeMoreCommentsResponse(post)
        const children = ["some", "child", "ren"]

        fetchJSONStub.returns(Promise.resolve(moreComments))

        const response = await getMoreComments(post.id, null, children)
        const payload = {
          post_id:  post.id,
          children: children
        }
        assert.ok(
          fetchJSONStub.calledWith(
            `/api/v0/morecomments/?${qs.stringify(payload)}`
          )
        )
        assert.deepEqual(response, moreComments)
      })

      it("replying to a parent", async () => {
        const post = makePost()
        const commentsResponse = makeCommentsResponse(post)
        const parent = commentsResponse[0]
        const moreComments = makeMoreCommentsResponse(post, parent.id)
        const children = ["some", "child", "ren"]

        fetchJSONStub.returns(Promise.resolve(moreComments))

        const response = await getMoreComments(post.id, parent.id, children)
        const payload = {
          post_id:   post.id,
          parent_id: parent.id,
          children:  children
        }
        assert.ok(
          fetchJSONStub.calledWith(
            `/api/v0/morecomments/?${qs.stringify(payload)}`
          )
        )
        assert.deepEqual(response, moreComments)
      })
    })

    it("reports a comment", async () => {
      const payload = {
        comment_id: 1,
        reason:     "spam"
      }
      fetchJSONStub.returns(Promise.resolve())

      await reportContent(payload)
      assert.ok(
        fetchJSONStub.calledWith(`/api/v0/reports/`, {
          method: POST,
          body:   JSON.stringify(payload)
        })
      )
    })

    it("reports a post", async () => {
      const payload = {
        post_id: 1,
        reason:  "spam"
      }
      fetchJSONStub.returns(Promise.resolve())

      await reportContent(payload)
      assert.ok(
        fetchJSONStub.calledWith(`/api/v0/reports/`, {
          method: POST,
          body:   JSON.stringify(payload)
        })
      )
    })
  })
})
