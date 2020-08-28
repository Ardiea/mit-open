// @flow
/* global SETTINGS: false */
import { assert } from "chai"
import sinon from "sinon"
import R from "ramda"

import CourseSearchPage from "./CourseSearchPage"

import SearchFacet from "../components/search/SearchFacet"
import * as LRCardModule from "../components/LearningResourceCard"

import IntegrationTestHelper from "../util/integration_test_helper"
import { shouldIf } from "../lib/test_utils"
import { makeSearchResult, makeSearchResponse } from "../factories/search"
import { makeChannel } from "../factories/channels"
import { LR_TYPE_ALL, LR_TYPE_COURSE } from "../lib/constants"
import { wait } from "../lib/util"
import {
  deserializeSearchParams,
  serializeSearchParams
} from "../lib/course_search"

const setLocation = (helper, params) => {
  const newParams = {
    text:         params.text ?? "text",
    activeFacets: R.merge(
      {
        audience:      [],
        certification: [],
        topics:        [],
        offered_by:    [],
        type:          []
      },
      params.activeFacets || {}
    )
  }

  helper.browserHistory.push(`?${serializeSearchParams(newParams)}`)
}

describe("CourseSearchPage", () => {
  let helper, render, searchResponse, initialState, searchCourse, replaceStub

  beforeEach(() => {
    helper = new IntegrationTestHelper()

    const channel = makeChannel()
    const numHits = 10
    searchResponse = makeSearchResponse(
      SETTINGS.search_page_size,
      numHits,
      "course",
      true
    )
    // Simulate an upvoted post
    searchCourse = makeSearchResult(LR_TYPE_COURSE)
    searchResponse.hits.hits[0] = searchCourse
    helper.searchStub.returns(Promise.resolve(searchResponse))

    helper.stubComponent(
      LRCardModule,
      "LearningResourceCard",
      "LearningResourceCard"
    )

    initialState = {
      channels: {
        data:   new Map([[channel.name, channel]]),
        loaded: true
      },
      posts: {
        data: new Map()
      },
      search: {
        loaded:     true,
        processing: false,
        data:       {
          results:     searchResponse.hits.hits.map(hit => hit._source),
          facets:      new Map(Object.entries(searchResponse.aggregations)),
          suggest:     ["test"],
          total:       searchResponse.hits.total,
          incremental: false
        }
      },
      entities: {
        courses: {}
      }
    }

    render = helper.configureReduxQueryRenderer(
      CourseSearchPage,
      {},
      initialState
    )

    replaceStub = helper.sandbox.spy(helper.browserHistory, "replace")
  })

  afterEach(() => {
    helper.cleanup(false)
  })

  it("renders search results", async () => {
    const { wrapper } = await render()
    wrapper.update()
    searchResponse.hits.hits.forEach((result, i) => {
      assert.deepEqual(
        wrapper
          .find("SearchResult")
          .at(i)
          .prop("result"),
        result._source
      )
    })
    assert.include(
      wrapper.find(".results-count").text(),
      searchResponse.hits.total
    )
  })

  it("renders the  Resource facet", async () => {
    const { wrapper } = await render()
    wrapper.update()
    assert.equal(
      wrapper
        .find(SearchFacet)
        .at(2)
        .prop("title"),
      "Learning Resource"
    )
  })

  //
  ;[
    ["mechical enginr", "mechanical engineer"],
    ['"mechical enginr"', '"mechanical engineer"']
  ].forEach(([text, suggestion]) => {
    it(`renders suggestion ${suggestion} for query ${text}`, async () => {
      initialState.search.data.suggest = ["mechanical engineer"]
      searchResponse.suggest = ["mechanical engineer"]
      setLocation(helper, { text })
      const { wrapper } = await render()
      wrapper.update()
      const suggestDiv = wrapper.find(".suggestion")
      assert.isOk(suggestDiv.text().includes("Did you mean"))
      assert.isOk(suggestDiv.text().includes(suggestion))
      suggestDiv.find("a").simulate("click")
      await wait(50)
      const [{ search }] = replaceStub.args[replaceStub.args.length - 1]
      assert.equal(search, `q=${escape(suggestion)}`)
    })
  })

  //
  ;["", "a"].forEach(query => {
    it(`still runs a search if initial search text is '${query}'`, async () => {
      setLocation(helper, { text: query })
      await render()
      sinon.assert.called(helper.searchStub)
    })
  })

  it("loads more results", async () => {
    SETTINGS.search_page_size = 5
    const { wrapper } = await render()
    wrapper.update()
    await wrapper.find("InfiniteScroll").prop("loadMore")()
    sinon.assert.calledWith(helper.searchStub, {
      channelName: null,
      from:        SETTINGS.search_page_size,
      size:        SETTINGS.search_page_size,
      text:        undefined,
      type:        LR_TYPE_ALL,
      facets:      new Map(
        Object.entries({
          audience:      [],
          certification: [],
          offered_by:    [],
          topics:        [],
          type:          LR_TYPE_ALL
        })
      )
    })
    wrapper.update()
    // from is 5, plus 5 is 10 which is == numHits so no more results
    assert.isFalse(wrapper.find("InfiniteScroll").prop("hasMore"))
  })

  it("searches with parameters", async () => {
    SETTINGS.search_page_size = 5
    setLocation(helper, {
      text:         "text",
      activeFacets: {
        topics:     ["Science", "Engineering"],
        offered_by: ["OCW"]
      }
    })

    await render()
    sinon.assert.calledWith(helper.searchStub, {
      channelName: null,
      from:        0,
      size:        SETTINGS.search_page_size,
      text:        "text",
      type:        LR_TYPE_ALL,
      facets:      new Map(
        Object.entries({
          audience:      [],
          certification: [],
          type:          LR_TYPE_ALL,
          offered_by:    ["OCW"],
          topics:        ["Science", "Engineering"]
        })
      )
    })
  })

  it("searches for podcast episodes when the type parameter is podcast", async () => {
    SETTINGS.search_page_size = 5
    setLocation(helper, {
      text:         "text",
      activeFacets: {
        audience:      [],
        certification: [],
        topics:        [],
        offered_by:    [],
        type:          ["podcast"]
      }
    })

    await render()
    sinon.assert.calledWith(helper.searchStub, {
      channelName: null,
      from:        0,
      size:        SETTINGS.search_page_size,
      text:        "text",
      type:        ["podcast", "podcastepisode"],
      facets:      new Map(
        Object.entries({
          audience:      [],
          certification: [],
          type:          ["podcast", "podcastepisode"],
          offered_by:    [],
          topics:        []
        })
      )
    })
  })

  //
  it("searches for learning path when the type parameter is userlist", async () => {
    setLocation(helper, {
      text:         "text",
      activeFacets: {
        audience:      [],
        certification: [],
        topics:        [],
        offered_by:    [],
        type:          ["userlist"]
      }
    })

    SETTINGS.search_page_size = 5
    await render()
    sinon.assert.calledWith(helper.searchStub, {
      channelName: null,
      from:        0,
      size:        SETTINGS.search_page_size,
      text:        "text",
      type:        ["userlist", "learningpath"],
      facets:      new Map(
        Object.entries({
          audience:      [],
          certification: [],
          type:          ["userlist", "learningpath"],
          offered_by:    [],
          topics:        []
        })
      )
    })
  })

  //
  ;[[true, false, false], [false, true, true], [true, true, true]].forEach(
    ([loaded, processing, shouldShowPostloading]) => {
      it(`${shouldIf(
        shouldShowPostloading
      )} show the loading UI when processing = ${String(
        processing
      )} and loaded = ${String(loaded)}`, async () => {
        let resolver
        helper.searchStub.returns(
          new Promise(resolve => {
            resolver = () => {
              resolve(searchResponse)
            }
          })
        )
        initialState.search.loaded = loaded
        initialState.search.processing = processing
        const { wrapper } = await render()

        if (!processing && loaded) {
          // $FlowFixMe
          await resolver()
          await wait(10)
        }
        wrapper.update()
        assert.equal(
          wrapper.find("CourseSearchLoading").exists(),
          shouldShowPostloading
        )
        assert.equal(wrapper.find(".results-count").exists(), !processing)
      })
    }
  )

  it("shows a message saying there are no results", async () => {
    searchResponse.hits.total = 0
    const { wrapper } = await render()
    wrapper.update()
    assert.equal(
      wrapper.find(".empty-list-msg").text(),
      "There are no results to display."
    )
  })

  it("uses the query parameter value as a default for the textbox", async () => {
    const text = "xyz"
    setLocation(helper, { text })
    const { wrapper } = await render()
    assert.equal(wrapper.find("CourseSearchbox").prop("value"), text)
  })

  it("updates the textbox, and echoes to URL bar on search", async () => {
    const { wrapper } = await render()
    const text = "newwwww text"
    wrapper.find("CourseSearchbox").prop("onChange")({
      target: {
        value: text
      }
    })
    wrapper.update()
    wrapper.find("CourseSearchbox").prop("onSubmit")({
      preventDefault: helper.sandbox.stub()
    })
    await wait(1)
    const [{ search }] = replaceStub.args[replaceStub.args.length - 1]
    assert.equal(search, `q=${escape(text)}`)
  })

  it("displays filters and clicking 'Clear all filters' removes all active facets", async () => {
    const text = "testtext wowowow"
    const activeFacets = {
      offered_by: ["OCW"],
      topics:     ["Science", "Law"],
      type:       LR_TYPE_ALL
    }
    setLocation(helper, { text, activeFacets })
    const { wrapper } = await render()
    wrapper.find(".clear-all-filters").simulate("click")
    await wait(1)
    const [{ search }] = replaceStub.args[replaceStub.args.length - 1]
    assert.deepEqual(search, "")
  })

  it("triggers a non-incremental search from textbox input", async () => {
    const { wrapper } = await render()
    const text = "some other text"
    const searchBox = wrapper.find("CourseSearchbox")
    searchBox.prop("onChange")({
      target: { value: text }
    })
    wrapper.update()
    wrapper.find("CourseSearchbox").prop("onSubmit")({
      preventDefault: helper.sandbox.stub()
    })
    await wait(1)
    const [{ search }] = replaceStub.args[replaceStub.args.length - 1]
    assert.deepEqual(deserializeSearchParams({ search }), {
      text,
      activeFacets: {
        audience:      [],
        certification: [],
        topics:        [],
        offered_by:    [],
        type:          []
      }
    })
  })

  it("triggers a non-incremental search when the facet changes", async () => {
    const text = "new text"
    setLocation(helper, { text })
    const { wrapper } = await render()
    wrapper
      .find(SearchFacet)
      .at(1)
      .props()
      .onUpdate({
        target: { name: "topics", value: "Physics", checked: true }
      })
    await wait(10)
    const [{ search }] = replaceStub.args[replaceStub.args.length - 1]

    assert.deepEqual(deserializeSearchParams({ search }), {
      text,
      activeFacets: {
        audience:      [],
        certification: [],
        topics:        ["Physics"],
        offered_by:    [],
        type:          []
      }
    })
  })

  it("facetOptions adds any selected facets not in results to the group", async () => {
    helper.browserHistory.push({
      search: serializeSearchParams({
        text:         "some text",
        activeFacets: {
          audience:      [],
          certification: [],
          offered_by:    [],
          topics:        ["NewTopic"]
        }
      })
    })
    const { wrapper } = await render()
    wrapper.update()
    const { topics } = wrapper.find("CourseFilterDrawer").prop("activeFacets")
    assert.deepEqual(topics, ["NewTopic"])
  })

  it("toggleFacet should let you turn off an active facet", async () => {
    helper.browserHistory.push({
      search: serializeSearchParams({
        text:         "some text",
        activeFacets: {
          audience:      [],
          certification: [],
          offered_by:    [],
          topics:        ["NewTopic"]
        }
      })
    })
    const { wrapper } = await render()
    wrapper.update()
    wrapper.find("CourseFilterDrawer").prop("toggleFacet")(
      "topics",
      "NewTopic",
      false
    )
    wrapper.update()
    const { topics } = wrapper.find("CourseFilterDrawer").prop("activeFacets")
    assert.deepEqual(topics, [])
  })
})
