import React, { useCallback } from "react"
import { useHistory } from "react-router"
import Button from "@mui/material/Button"
import Grid from "@mui/material/Grid"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import ListItemIcon from "@mui/material/ListItemIcon"
import IconButton from "@mui/material/IconButton"
import Container from "@mui/material/Container"

import { BannerPage, LoadingSpinner, MetaTags, useToggle } from "ol-util"
import type { LearningPathResource } from "api"
import { useLearningPathsList } from "api/hooks/learningResources"

import { GridColumn, GridContainer } from "../../components/layout"

import { LearningResourceCardTemplate } from "ol-learning-resources"

import { imgConfigs } from "../../util/constants"
import { manageListDialogs } from "./ManageListDialogs"

import * as urls from "../urls"

type EditListMenuProps = {
  resource: LearningPathResource
}
const EditListMenu: React.FC<EditListMenuProps> = ({ resource }) => {
  const [open, toggleOpen] = useToggle(false)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const handleEdit = useCallback(() => {
    manageListDialogs.upsert(resource)
    toggleOpen.off()
  }, [resource, toggleOpen])
  const handleDelete = useCallback(() => {
    manageListDialogs.destroy(resource)
    toggleOpen.off()
  }, [resource, toggleOpen])
  return (
    <>
      <IconButton
        aria-label={`Edit list ${resource.title}`}
        onClick={toggleOpen.on}
        ref={setAnchorEl}
        size="small"
      >
        <MoreVertIcon fontSize="inherit" />
      </IconButton>
      <Menu open={open} onClose={toggleOpen.off} anchorEl={anchorEl}>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
    </>
  )
}

type ListCardProps = {
  list: LearningPathResource
  onActivate: (resource: LearningPathResource) => void
  canEdit: boolean
}
const ListCard: React.FC<ListCardProps> = ({ list, onActivate, canEdit }) => {
  return (
    <LearningResourceCardTemplate
      variant="row-reverse"
      className="ic-resource-card"
      resource={list}
      imgConfig={imgConfigs["row-reverse-small"]}
      footerActionSlot={canEdit ? <EditListMenu resource={list} /> : null}
      onActivate={onActivate}
    />
  )
}

const LearningPathListingPage: React.FC = () => {
  const listingQuery = useLearningPathsList()

  const history = useHistory()
  const handleActivate = useCallback(
    (resource: LearningPathResource) => {
      const path = urls.learningPathsView(resource.id)
      history.push(path)
    },
    [history],
  )
  const handleCreate = useCallback(() => {
    manageListDialogs.upsert()
  }, [])

  const canEdit = window.SETTINGS.user.is_learning_path_editor

  return (
    <BannerPage
      src="/static/images/course_search_banner.png"
      alt=""
      compactOnMobile
      className="learningpaths-page"
    >
      <MetaTags>
        <title>Learning Paths</title>
      </MetaTags>
      <Container maxWidth="sm">
        <GridContainer>
          <GridColumn variant="single-full">
            <Grid container className="list-header">
              <Grid item xs={6}>
                <h1>Learning Paths</h1>
              </Grid>
              <Grid item xs={6} className="ic-centered-right">
                {canEdit ? (
                  <Button variant="contained" onClick={handleCreate}>
                    Create new list
                  </Button>
                ) : null}
              </Grid>
            </Grid>
            <section>
              <LoadingSpinner loading={listingQuery.isLoading} />
              {listingQuery.data && (
                <ul className="ic-card-row-list">
                  {listingQuery.data.results?.map((list) => {
                    return (
                      <li key={list.id}>
                        <ListCard
                          list={list}
                          onActivate={handleActivate}
                          canEdit={canEdit}
                        />
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          </GridColumn>
        </GridContainer>
      </Container>
    </BannerPage>
  )
}

export default LearningPathListingPage
