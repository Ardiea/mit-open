import type { EmbedlyConfig as DeprecatedEmbedlyConfig } from "ol-search-ui"
import type { EmbedlyConfig } from "ol-learning-resources"

const deprecatedImgConfig = (
  config: EmbedlyConfig
): DeprecatedEmbedlyConfig => ({
  embedlyKey: config.key,
  width:      config.width,
  height:     config.height,
  ocwBaseUrl: SETTINGS.ocw_next_base_url
})

const imgConfigs = {
  row: {
    key:    SETTINGS.embedlyKey,
    width:  170,
    height: 130
  },
  "row-reverse": {
    key:    SETTINGS.embedlyKey,
    width:  170,
    height: 130
  },
  "row-reverse-small": {
    key:    SETTINGS.embedlyKey,
    width:  160,
    height: 100
  },
  column: {
    key:    SETTINGS.embedlyKey,
    width:  220,
    height: 170
  }
} satisfies Record<string, EmbedlyConfig>

export { imgConfigs, deprecatedImgConfig }
