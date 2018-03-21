// @flow
import React from "react"
import { assert } from "chai"
import { shallow } from "enzyme"
import { Link } from "react-router-dom"

import Navigation from "./Navigation"
import SubscriptionsList from "./SubscriptionsList"
import UserInfo from "./UserInfo"

import { newPostURL } from "../lib/url"
import { makeChannelList } from "../factories/channels"

describe("Navigation", () => {
  const defaultProps = { pathname: "/", subscribedChannels: [] }
  const renderComponent = (props = defaultProps) =>
    shallow(<Navigation {...props} />)

  it("create post link should not have channel name if channelName is not in URL", () => {
    const wrapper = renderComponent()
    assert.lengthOf(wrapper.find(Link), 2)
    const props = wrapper.find(Link).at(0).props()
    assert.equal(props.to, "/create_post/")
    assert.equal(props.children, "Submit a New Post")
  })

  it("create post link should have channel name if channelName is in URL", () => {
    const wrapper = renderComponent({
      ...defaultProps,
      pathname: "/channel/foobar"
    })
    const link = wrapper.find(Link).first()
    assert.equal(link.props().to, newPostURL("foobar"))
    assert.equal(link.props().children, "Submit a New Post")
  })

  it("should show a SubscriptionsList", () => {
    const channels = makeChannelList(10)
    const wrapper = renderComponent({
      ...defaultProps,
      subscribedChannels: channels
    })
    assert.equal(
      wrapper.find(SubscriptionsList).props().subscribedChannels,
      channels
    )
  })

  it("should show UserInfo", () => {
    const wrapper = renderComponent()
    assert.ok(wrapper.find(UserInfo).exists())
  })

  it("should pass the current channel down to the SubscriptionsList", () => {
    const wrapper = renderComponent({
      ...defaultProps,
      pathname: "/channel/foobar"
    })
    assert.equal(
      wrapper.find(SubscriptionsList).props().currentChannel,
      "foobar"
    )
  })

  it("should have a link to the settings", () => {
    const wrapper = renderComponent()
    const { children, to, className } = wrapper.find(Link).at(1).props()
    assert.equal(children, "Settings")
    assert.equal(className, "settings-link")
    assert.equal(to, "/settings")
  })
})
