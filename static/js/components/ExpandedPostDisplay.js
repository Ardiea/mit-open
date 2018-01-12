// @flow
/* global SETTINGS: false */
import React from "react"
import moment from "moment"
import ReactMarkdown from "react-markdown"
import R from "ramda"

import { EditPostForm } from "../components/CommentForms"

import { formatPostTitle, PostVotingButtons } from "../lib/posts"
import { addEditedMarker } from "../lib/reddit_objects"
import { editPostKey } from "../components/CommentForms"

import type { Post } from "../flow/discussionTypes"
import type { FormsState } from "../flow/formTypes"

const textContent = post =>
  <ReactMarkdown
    disallowedTypes={["Image"]}
    source={addEditedMarker(post)}
    escapeHtml
    className="text-content"
  />

export default class ExpandedPostDisplay extends React.Component<*, void> {
  props: {
    post: Post,
    toggleUpvote: Post => void,
    approvePost: Post => void,
    removePost: Post => void,
    forms: FormsState,
    isModerator: boolean,
    beginEditing: (key: string, initialValue: Object, e: ?Event) => void,
    showPostDeleteDialog: () => void,
    showPostReportDialog: () => void,
    showPermalinkUI: boolean
  }

  renderTextContent = () => {
    const { forms, post } = this.props

    return R.has(editPostKey(post), forms)
      ? <EditPostForm post={post} editing />
      : textContent(post)
  }

  approvePost = (e: Event) => {
    const { post, approvePost } = this.props

    e.preventDefault()

    approvePost(post)
  }

  removePost = (e: Event) => {
    const { post, removePost } = this.props

    e.preventDefault()

    removePost(post)
  }

  postActionButtons = () => {
    const {
      toggleUpvote,
      post,
      beginEditing,
      isModerator,
      showPostDeleteDialog,
      showPostReportDialog
    } = this.props

    return (
      <div className="post-actions">
        <PostVotingButtons
          post={post}
          className="expanded"
          toggleUpvote={toggleUpvote}
        />
        {SETTINGS.username === post.author_id && post.text
          ? <div
            className="comment-action-button edit-post"
            onClick={beginEditing(editPostKey(post), post)}
          >
            <a href="#">edit</a>
          </div>
          : null}
        {SETTINGS.username === post.author_id
          ? <div
            className="comment-action-button delete-post"
            onClick={showPostDeleteDialog}
          >
            <a href="#">delete</a>
          </div>
          : null}
        {isModerator && !post.removed
          ? <div
            className="comment-action-button remove-post"
            onClick={this.removePost.bind(this)}
          >
            <a href="#">remove</a>
          </div>
          : null}
        {isModerator && post.removed
          ? <div
            className="comment-action-button approve-post"
            onClick={this.approvePost.bind(this)}
          >
            <a href="#">approve</a>
          </div>
          : null}
        <div
          className="comment-action-button report-post"
          onClick={showPostReportDialog}
        >
          <a href="#">report</a>
        </div>
      </div>
    )
  }

  render() {
    const { post, forms, showPermalinkUI } = this.props
    const formattedDate = moment(post.created).fromNow()

    return (
      <div className="post-summary expanded">
        <div className="summary">
          <img className="profile-image" src={post.profile_image} />
          <div className="post-title">
            {formatPostTitle(post)}
          </div>
          <div className="authored-by">
            by <span className="author-name">{post.author_name}</span>,{" "}
            {formattedDate}
          </div>
        </div>
        {!showPermalinkUI && post.text ? this.renderTextContent() : null}
        {R.has(editPostKey(post), forms) ? null : this.postActionButtons()}
      </div>
    )
  }
}
