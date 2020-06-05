import React, {Component} from 'react';
import {InputText} from 'primereact/inputtext';
import PropTypes from 'prop-types';

export class AppTopbar extends Component {
    

    static defaultProps = {
        onToggleMenu: null,
        logout: null
    }

    static propTypes = {
        onToggleMenu: PropTypes.func.isRequired,
        logout: PropTypes.func.isRequired
    }

    render() {
        return (
            <div className="layout-topbar clearfix">
                <button className="p-link layout-menu-button" onClick={this.props.onToggleMenu}>
                    <span className="pi pi-bars"/>
                </button>

                <div className="layout-topbar-icons">
                    <button className="p-link" onClick={this.props.logout}>
                        <span className="layout-topbar-item-text">Logout</span>
                        <span className="layout-topbar-icon pi pi-fw pi-power-off" />
                    </button>
                    {/* <button className="p-link">
                        <span className="layout-topbar-item-text">User</span>
                        <span className="layout-topbar-icon pi pi-user"/>
                    </button> */}
                </div>
            </div>
        );
    }
}