import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import warning from "warning";

import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Menu from "@material-ui/core/Menu";
import DropdownArrow from "@material-ui/icons/ArrowDropDown";
import Button from "./TableListButton";

const styles = {
  root: {
    paddingRight: 0,
  },
  button: {
    display: "flex",
  },
  arrow: {
    marginTop: -4,
  },
};

export class TableListSelect extends React.Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
    label: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  static defaultProps = {
    className: "",
  };

  state = {
    anchorEl: null,
  };

  //
  // Handlers

  handleClose = ev => {
    this.setState({ anchorEl: null });
    ev.stopPropagation();
  };

  handleOpen = ev => {
    this.setState({ anchorEl: ev.currentTarget });
  };

  render() {
    const { classes, className: classNameProp, label, ...props } = this.props;
    const { anchorEl } = this.state;

    const menuItems = React.Children.map(this.props.children, child => {
      const { value, onClick: onClickProp } = child.props;

      warning(
        value === undefined || onClickProp === undefined,
        "MenuListSelect: child component must have value on onClick handler.",
      );

      const onClick = ev => {
        if (value !== undefined) {
          this.props.onChange(value);
        }
        if (onClickProp !== undefined) {
          onClickProp(ev);
        }
        this.handleClose(ev);
      };
      return React.cloneElement(child, { onClick, value: undefined });
    });

    const className = classnames(classes.root, classNameProp);
    return (
      <Button className={className} onClick={this.handleOpen} {...props}>
        <span className={classes.button}>
          <Typography variant="button">{label}</Typography>
          <DropdownArrow className={classes.arrow} />
        </span>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
          id={`events-container-menu-${label}`}
        >
          {menuItems}
        </Menu>
      </Button>
    );
  }
}

export default withStyles(styles)(TableListSelect);
