Release Notes
=============

Version 0.9.13 (Released May 16, 2024)
--------------

- Adds learner testimonials support (#891)
- Null start dates for OCW course runs (#899)
- Featured API endpoint (#887)

Version 0.9.12 (Released May 14, 2024)
--------------

- use neue-haas-grotesk font (#889)
- Shanbady/add subscribe button to pages (#878)
- bump course-search-utils (#900)
- Replace react-dotdotdot with CSS (#896)
- Switch django migrations to release phase (#898)
- Do not show unpublished runs in learning resource serializer data (#894)
- Fix some n+1 query warnings (#884)

Version 0.9.11 (Released May 13, 2024)
--------------

- add format facet (#888)
- Free everything (#885)
- Add nesting learning resource topics (#844)

Version 0.9.10 (Released May 09, 2024)
--------------

- search dropdown (#875)
- Add certificate as a real database field to LearningResource (#862)
- allow Button to hold a ref (#883)
- Display loading view for search page (#881)

Version 0.9.9 (Released May 09, 2024)
-------------

- fix spacing between department groups (#880)
- #4053 Alert UI component (#861)

Version 0.9.8 (Released May 08, 2024)
-------------

- Departments Listing Page (#865)
- only show clear all if it would do something (#877)
- create exported components bundle (#867)
- Update Yarn to v4.2.1 (#872)
- Update docker.elastic.co/elasticsearch/elasticsearch Docker tag to v7.17.21 (#871)
- Update dependency ruff to v0.4.3 (#870)
- Update codecov/codecov-action action to v4.3.1 (#869)

Version 0.9.7 (Released May 06, 2024)
-------------

- Api sort fixes (#846)
- configure api BASE_PATH (#863)

Version 0.9.6 (Released May 03, 2024)
-------------

- Additional routes to the Django app (#858)
- allow configuring Axios defaults.withCredentials (#854)
- Alert handler for percolate matches (#842)
- Adds the missing OIDC auth route (#855)
- Learning format filter for search/db api's (#845)
- Corrects the path to write hash.txt (#850)
- Lock file maintenance (#578)
- Self contained front end and fixes for building on Heroku (#829)
- remove pytz (#830)
- Update dependency dj-database-url to v2 (#839)
- Update dependency cryptography to v42 (#838)
- Add format field to LearningResource model and ETL pipelines (#828)

Version 0.9.5 (Released April 30, 2024)
-------------

- Minor updates for PostHog settings (#833)
- Update nginx Docker tag to v1.26.0 (#836)
- Update dependency @types/react to v18.3.1 (#835)
- Update dependency ruff to v0.4.2 (#834)
- Don't initialize PostHog if it's disabled (#831)

Version 0.9.4 (Released April 30, 2024)
-------------

- Text Input + Select components (#827)
- Update ckeditor monorepo to v41 (major) (#795)
- Do not analyze webpack by default (#785)
- Populate prices for mitxonline programs (#817)
- Filter for free resources (#810)
- Add drop down for certification in channel search (#802)
- Pin dependencies (#735)
- Update dependency @dnd-kit/sortable to v8 (#796)
- Design system buttons (#800)
- Reverts decoupled front end and subsequent commits to fix Heroku build errors (#825)
- Remove package manager config (#823)
- Set engines to instruct Heroku to install yarn (#821)
- Deployment fixes for static frontend on Heroku (#819)
- fixing compose mount (#818)
- Move hash.txt location to frontend build directory (#815)
- Build front end to make available on Heroku (#813)
- Updating the LearningResourceViewEvent to cascade delete, rather than do nothing, so things can be deleted (#812)
- Self contained front end using Webpack to build HTML and Webpack Dev Server to serve (#678)
- create api routes for user subscribe/unsubscribe to search (#782)
- Retrieve OL events via API instead of HTML scraping (#786)

Version 0.9.3 (Released April 23, 2024)
-------------

- Fix index schema (#807)
- Merge the lrd_view migration and the schools migration (#804)
- School model and api (#788)
- Adds ETL to pull PostHog view events into the database; adds popular resource APIs (#789)
- Update dependency @typescript-eslint/eslint-plugin to v7 (#801)
- Update opensearchproject/opensearch Docker tag to v2.13.0 (#794)
- Update mcr.microsoft.com/playwright Docker tag to v1.43.1 (#793)
- Update dependency ruff to v0.4.1 (#792)
- Update nginx Docker tag to v1.25.5 (#791)
- Update dependency @types/react to v18.2.79 (#790)
- Capture page views with more information (#746)

Version 0.9.2 (Released April 22, 2024)
-------------

- adding manual migration to fix foreign key type (#752)
- Add channel url to topic, department, and offeror serializers (#778)
- Filter channels api by channel_type (#779)

Version 0.9.1 (Released April 18, 2024)
-------------

- Homepage hero section (#754)
- Add necessary celery client configurables for celery monitoring (#780)

Version 0.9.0 (Released April 16, 2024)
-------------

- Customize channel page facets by channel type (#756)
- Update dependency sentry-sdk to v1.45.0 (#775)
- Update dependency posthog-js to v1.121.2 (#774)
- Update dependency ipython to v8.23.0 (#773)
- Update dependency google-api-python-client to v2.125.0 (#772)
- Update all non-major dev-dependencies (#768)
- Update dependency @testing-library/react to v14.3.1 (#771)
- Update dependency @sentry/react to v7.110.0 (#770)
- Update codecov/codecov-action action to v4.3.0 (#769)
- Update material-ui monorepo (#767)
- Update docker.elastic.co/elasticsearch/elasticsearch Docker tag to v7.17.20 (#765)
- Update dependency uwsgi to v2.0.25 (#766)
- Update dependency ruff to v0.3.7 (#763)
- Update dependency qs to v6.12.1 (#762)
- Update dependency drf-spectacular to v0.27.2 (#761)
- Update dependency boto3 to v1.34.84 (#760)
- Update Node.js to v20.12.2 (#759)
- Pin dependency @types/react to 18.2.73 (#758)
- Add a channel for every topic, department, offeror (#749)
- Update dependency djangorestframework to v3.15.1 (#628)
- Shanbady/define percolate index schema (#737)

Version 0.8.0 (Released April 11, 2024)
-------------

- Channel Search (#740)
- fixing readonly exception in migration (#741)
- fix channel configuration (#743)
- Configurable, Tabbed Carousels (#731)
- add userlist bookmark button and add to user list modal (#732)
- Adds Posthog support to the frontend. (#693)
- Channel types (#725)
- Remove dupe line from urls.py file (#730)
- adding initial models for user subscription (#723)
- Shanbady/add record hash field for hightouch sync (#717)
- fix flaky test (#720)
- Revert "bump to 2024.3.22" (#719)
- add UserList modals and wire up buttons (#718)
- bump to 2024.3.22
- Migrate config renovate.json (#713)
- try ckeditor grouping again (#711)

Version 0.7.0 (Released April 01, 2024)
-------------

- Basic learning resources drawer (#686)
- Update actions/configure-pages action to v5 (#706)
- display image and description in userlists (#695)
- Update dependency sentry-sdk to v1.44.0 (#705)
- Update dependency google-api-python-client to v2.124.0 (#704)
- Update dependency @sentry/react to v7.109.0 (#703)
- Update Node.js to v20.12.0 (#702)
- Update docker.elastic.co/elasticsearch/elasticsearch Docker tag to v7.17.19 (#701)
- Update dependency safety to v2.3.5 (#700)
- Update dependency nh3 to v0.2.17 (#699)
- Update dependency boto3 to v1.34.74 (#698)
- Update all non-major dev-dependencies (#696)
- Update dependency @emotion/styled to v11.11.5 (#697)
- Add botocore to ignored deprecation warnings, remove old python 3.7 ignore line (#692)
- Add UserListDetails page (#691)
- Add Posthog integration to backend (#682)
- Update postgres Docker tag to v12.18 (#670)
- remove depricated ACL setting (#690)
- fix new upcoming (#684)
- Remove Cloudfront references (#689)
- updating spec (#688)
- Shanbady/endpoint to retrieve session data (#647)
- Sloan Executive Education blog ETL (#679)

Version 0.6.1 (Released April 01, 2024)
-------------

- Search page cleanup (#675)
- Shanbady/retrieve environment config (#653)
- Update codecov/codecov-action action to v4 (#671)
- Add userlists page and refactor LearningResourceCardTemplate (#650)
- fields pages (#633)
- [pre-commit.ci] pre-commit autoupdate (#677)
- fix learningpath invalidation (#635)

Version 0.6.0 (Released March 26, 2024)
-------------

- News & Events API (#638)
- Update opensearchproject/opensearch Docker tag to v2.12.0 (#669)
- Update mcr.microsoft.com/playwright Docker tag to v1.42.1 (#667)
- Update dependency yup to v1.4.0 (#666)
- Update dependency type-fest to v4.14.0 (#668)
- Update dependency sentry-sdk to v1.43.0 (#665)
- Update dependency rc-tooltip to v6.2.0 (#664)
- Update dependency qs to v6.12.0 (#663)
- Update dependency pytest-mock to v3.14.0 (#662)
- Update dependency google-api-python-client to v2.123.0 (#661)
- Update dependency @sentry/react to v7.108.0 (#660)
- Update material-ui monorepo (#659)
- Update dependency ruff to v0.3.4 (#657)
- Update dependency boto3 to v1.34.69 (#656)
- Update all non-major dev-dependencies (#654)
- generate v0 apis (#651)
- MIT news/events ETL  (#612)
- Remove all usages of pytz (#646)
- allow filtering by readable id in the api (#639)
- Update jest-dom, make TS aware (#637)
- fixing ordering of response data in test (#634)
- [pre-commit.ci] pre-commit autoupdate (#610)
- Update dependency eslint-plugin-testing-library to v6 (#354)
- Update Yarn to v3.8.1 (#455)

Version 0.5.1 (Released March 19, 2024)
-------------

- Add a Search Page (#618)
- pushing fix for test failure (#631)
- shanbady/separate database router and schema for program certificates (#617)
- Update dependency django-anymail to v10.3 (#627)
- Update dependency @sentry/react to v7.107.0 (#626)
- Update react-router monorepo to v6.22.3 (#625)
- Update material-ui monorepo (#624)
- Update dependency boto3 to v1.34.64 (#623)
- Update dependency axios to v1.6.8 (#622)
- Update dependency @ckeditor/ckeditor5-dev-utils to v39.6.3 (#621)
- Update dependency @ckeditor/ckeditor5-dev-translations to v39.6.3 (#620)
- Update all non-major dev-dependencies (#619)
- Endpoint for user program certificate info and program letter links (#608)
- Update Node.js to v20 (#507)
- Program Letter View (#605)

Version 0.5.0 (Released March 13, 2024)
-------------

- Avoid duplicate courses (#603)
- Type-specific api endpoints for videos and video playlists (#595)
- Update dependency ipython to v8.22.2 (#600)
- Update dependency html-entities to v2.5.2 (#599)
- Update dependency boto3 to v1.34.59 (#598)
- Update dependency Django to v4.2.11 (#597)
- Update all non-major dev-dependencies (#596)
- Assign topics to videos and playlists (#584)
- Add daily micromasters ETL task to celerybeat schedule (#585)

Version 0.4.1 (Released March 08, 2024)
-------------

- resource_type changes (#583)
- Update nginx Docker tag to v1.25.4 (#544)
- Youtube video ETL and search (#558)

Version 0.4.0 (Released March 06, 2024)
-------------

- Update dependency ruff to ^0.3.0 (#577)
- Update dependency html-entities to v2.5.0 (#576)
- Update dependency python-rapidjson to v1.16 (#575)
- Update dependency python-dateutil to v2.9.0 (#574)
- Update dependency google-api-python-client to v2.120.0 (#573)
- Update dependency @sentry/react to v7.104.0 (#572)
- Update react-router monorepo to v6.22.2 (#571)
- Update dependency storybook-addon-react-router-v6 to v2.0.11 (#570)
- Update dependency sentry-sdk to v1.40.6 (#569)
- Update dependency markdown2 to v2.4.13 (#568)
- Update dependency ddt to v1.7.2 (#567)
- Update dependency boto3 to v1.34.54 (#566)
- Update dependency @ckeditor/ckeditor5-dev-utils to v39.6.2 (#565)
- Update dependency @ckeditor/ckeditor5-dev-translations to v39.6.2 (#564)
- Update all non-major dev-dependencies (#563)
- Create program certificate django model (#561)
- fix OpenAPI response for content_file_search (#559)
- Update material-ui monorepo (#233)
- next/previous links for search api (#550)
- Remove livestream app (#549)
- Assign best date available to LearningResourceRun.start_date field (#514)
- Update dependency ipython to v8.22.1 (#547)
- Update dependency google-api-python-client to v2.119.0 (#546)
- Update dependency @sentry/react to v7.102.1 (#545)
- Update mcr.microsoft.com/playwright Docker tag to v1.41.2 (#543)
- Update dependency sentry-sdk to v1.40.5 (#542)
- Update dependency iso-639-1 to v3.1.2 (#540)
- Update dependency boto3 to v1.34.49 (#541)
- Update all non-major dev-dependencies (#539)

Version 0.3.3 (Released March 04, 2024)
-------------

- Save user with is_active from SCIM request (#535)
- Add SCIM client (#513)
- CI and test fixtures for E2E testing (#481)
- Update postgres Docker tag to v12.18 (#530)
- Update dependency responses to ^0.25.0 (#529)
- Update dependency google-api-python-client to v2.118.0 (#528)
- Update dependency @sentry/react to v7.101.1 (#527)
- Update react-router monorepo to v6.22.1 (#526)
- Update nginx Docker tag to v1.25.4 (#524)
- Update dependency ruff to v0.2.2 (#525)
- Update dependency social-auth-core to v4.5.3 (#523)
- Update dependency sentry-sdk to v1.40.4 (#522)
- Update dependency iso-639-1 to v3.1.1 (#521)
- Update dependency boto3 to v1.34.44 (#520)
- Update all non-major dev-dependencies (#519)
- Update Node.js to v18.19.1 (#518)

Version 0.3.2 (Released February 20, 2024)
-------------

- Update ruff and adjust code to new criteria (#511)
- Avoid using get_or_create for LearningResourceImage object that has no unique constraint (#510)
- Update SimenB/github-actions-cpu-cores action to v2 (#508)
- Update dependency sentry-sdk to v1.40.3 (#506)
- Update dependency react-share to v5.1.0 (#504)
- Update dependency pytest-django to v4.8.0 (#503)
- Update dependency google-api-python-client to v2.117.0 (#502)
- Update dependency faker to v22.7.0 (#501)
- Update dependency @sentry/react to v7.100.1 (#499)
- Update docker.elastic.co/elasticsearch/elasticsearch Docker tag to v7.17.18 (#498)
- Update dependency uwsgi to v2.0.24 (#497)
- Update all non-major dev-dependencies (#500)
- Update dependency boto3 to v1.34.39 (#496)
- Update dependency Django to v4.2.10 (#495)
- Update dependency @ckeditor/ckeditor5-dev-utils to v39.6.1 (#493)
- Update dependency @ckeditor/ckeditor5-dev-translations to v39.6.1 (#492)
- Update all non-major dev-dependencies (#491)
- fix topics schema (#488)
- Use root document counts to avoid overcounting in aggregations (#484)

Version 0.3.1 (Released February 14, 2024)
-------------

- Avoid integrity errors when loading instructors (#478)
- Load fixtures by default in dev environment (#483)
- upgrading version of poetry (#480)
- Fix multiword search filters & aggregations, change Non Credit to Non-Credit
- Update dependency nplusone to v1 (#381)
- Update dependency pytest-env to v1 (#382)

Version 0.3.0 (Released February 09, 2024)
-------------

- Allow for blank OCW terms/years (adjust readable_id accordingly), raise an error at end of ocw_courses_etl function if any exceptions occurred during processing (#475)
- Remove all references to open-discussions (#472)
- Fix prolearn etl (#471)
- Multiple filter options for learningresources and contenfiles API rest endpoints (#449)
- Lock file maintenance (#470)
- Update dependency pluggy to v1.4.0 (#468)
- Update dependency jekyll-feed to v0.17.0 (#467)
- Update dependency @types/react to v18.2.53 (#469)
- Update dependency ipython to v8.21.0 (#466)
- Update dependency google-api-python-client to v2.116.0 (#465)
- Update dependency django-debug-toolbar to v4.3.0 (#464)
- Update dependency @sentry/react to v7.99.0 (#463)
- Update apache/tika Docker tag to v2.5.0 (#461)
- Update docker.elastic.co/elasticsearch/elasticsearch Docker tag to v7.17.17 (#460)
- Update dependency prettier to v3.2.5 (#462)
- Update dependency social-auth-core to v4.5.2 (#458)
- Update dependency toolz to v0.12.1 (#459)
- Update dependency moto to v4.2.14 (#457)
- Update dependency drf-spectacular to v0.27.1 (#456)
- Update dependency boto3 to v1.34.34 (#454)
- Update dependency beautifulsoup4 to v4.12.3 (#453)
- Update dependency axios to v1.6.7 (#452)
- Update codecov/codecov-action action to v3.1.6 (#451)
- Update all non-major dev-dependencies (#450)
- Added support to set SOCIAL_AUTH_ALLOWED_REDIRECT_HOSTS (#429)
- do not allow None in levels/languages (#446)

Version 0.2.2 (Released February 02, 2024)
-------------

- Fix webhook url (#442)
- Update akhileshns/heroku-deploy digest to 581dd28 (#366)
- Poetry install to virtualenv (#436)
- rename oasdiff workflow (#437)
- Upgrade tika and disable OCR via headers (#430)
- Add a placeholder dashboard page (#428)
- Update dependency faker to v22 (#378)
- Update dependency jest-fail-on-console to v3 (#380)
- Save OCW contentfiles as absolute instead of relative (#424)
- Check for breaking openapi changes on ci (#425)
- Initial E2E test setup with Playwright (#419)
- Use DRF NamespaceVersioning to manage OpenAPI api versions (#411)

Version 0.2.1 (Released January 30, 2024)
-------------

- Modify OCW webhook endpoint to handle multiple courses (#412)
- Optionally skip loading OCW content files (#413)
- Add /api/v0/users/me API (#415)

Version 0.2.0 (Released January 26, 2024)
-------------

- Get rid of tika verify warning (#410)
- Improve contentfile api query performance (#409)
- Search: Tweak aggregations formattings, add OpenAPI schema for metadata (#407)
- Remove unused django apps (#398)

Version 0.1.1 (Released January 19, 2024)
-------------

- Replace Sass styles with Emotion's CSS-in-JS (#390)
- move openapi spec to subdir (#397)
- Add Storybook to present front end components (#360)
- remove legacy search (#365)
- Remove author from LearningPath serializer (#385)

Version 0.1.0 (Released January 09, 2024)
-------------

- chore(deps): update dependency github-pages to v228 (#379)
