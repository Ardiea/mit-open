import React from "react"
import type { Meta, StoryObj } from "@storybook/react"
import Chip from "@mui/material/Chip"
import type { ChipProps } from "@mui/material/Chip"
import Stack from "@mui/material/Stack"
import { fn } from "@storybook/test"
import { ChipLink } from "./ChipLink"
import { withRouter } from "storybook-addon-react-router-v6"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"

const icons = {
  None: undefined,
  CalendarTodayIcon: <CalendarTodayIcon />,
  DeleteIcon: <DeleteIcon />,
  EditIcon: <EditIcon />,
}

const COLORS: ChipProps["color"][] = [
  "default",
  "primary",
  "secondary",
] as const
const VARIANTS: {
  variant: ChipProps["variant"]
  label: string
}[] = [
  {
    variant: "filled",
    label: "Filled",
  },
  {
    variant: "outlined",
    label: "Outlined",
  },
] as const

const meta: Meta<typeof Chip> = {
  title: 'smoot-design/Chip ("Pill")',
  argTypes: {
    icon: {
      control: { type: "select" },
      options: Object.keys(icons),
      mapping: icons,
    },
    onClick: {
      control: { type: "select" },
      options: ["None", "handler"],
      mapping: { None: undefined, handler: fn() },
    },
    onDelete: {
      control: { type: "select" },
      options: ["None", "handler"],
      mapping: { handler: fn() },
    },
    disabled: {
      control: { type: "boolean" },
    },
  },
  render: (args) => {
    return (
      <Stack gap={1}>
        {VARIANTS.map(({ variant, label }) => (
          <Stack key={variant} direction="row" gap={2}>
            {COLORS.map((color) => (
              <Chip
                {...args}
                key={color}
                variant={variant}
                color={color}
                label={label}
              />
            ))}
          </Stack>
        ))}
        {VARIANTS.map(({ variant, label }) => (
          <Stack key={variant} direction="row" gap={2}>
            {COLORS.map((color) => (
              <Chip
                {...args}
                size="large"
                variant={variant}
                key={color}
                color={color}
                label={label}
              />
            ))}
          </Stack>
        ))}
      </Stack>
    )
  },
}

export default meta

type Story = StoryObj<typeof Chip>

export const Variants: Story = {}

export const Buttons: Story = {
  args: {
    onClick: fn(),
  },
}

export const Deleteable: Story = {
  args: {
    onDelete: fn(),
  },
}

export const Disabled: Story = {
  args: {
    onClick: fn(),
    disabled: true,
  },
}

export const Icons: Story = {
  args: {
    icon: <CalendarTodayIcon />,
  },
}

type StoryChipLink = StoryObj<typeof ChipLink>
export const Links: StoryChipLink = {
  render: (args) => {
    return (
      <Stack direction="row" gap={2}>
        <ChipLink {...args} label="Link" href="" />
        <ChipLink {...args} label="Link" color="primary" href="" />
        <ChipLink {...args} label="Link" color="secondary" href="" />
      </Stack>
    )
  },
  decorators: [withRouter],
}
