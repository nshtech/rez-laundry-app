import React, { Component } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column'

import firebase from 'firebase/app';
import 'firebase/database';


import customerData from '../customers.json';
// import classNames from 'classnames';

import '../Dashboard.css';
//import { arrayToHash } from '@fullcalendar/core/util/object';


export class CustomerSheet extends Component {

    constructor() {
        super();
        this.state = {
            customers: customerData,
            selectedStatus: null,
            editing: false
        };
        this.edit = this.edit.bind(this);
        this.save = this.save.bind(this);
        this.export = this.export.bind(this);
        this.onStatusFilterChange = this.onStatusFilterChange.bind(this);

    }
 export() {
     this.dt.exportCSV();
 }

 edit() {
    this.setState({editing: true});
 }

save() {
    this.setState({ editing: false });
}

 statusBodyTemplate(rowData) {
     return <span className={rowData.laundrystatus}>{rowData.laundrystatus.replace(/-/g,' ')}</span>;
 }

 renderStatusFilter() {
   var statuses =  [
     {label: 'Picked Up', value: 'picked-up'},
      {label: 'Being Cleaned', value: 'being-cleaned'},
      {label: 'Out for Delivery', value: 'out-for-delivery'},
      {label: 'Delivered', value: 'delivered'},
      {label: 'Bag Missing', value: 'bag-missing'}
          ];
     return (
         <Dropdown value={this.state.selectedStatus} options={statuses} onChange={this.onStatusFilterChange}
                    showClear={true} placeholder="Select a Status" className="p-column-filter" />
     );
 }


 onStatusFilterChange(event) {
        this.dt.filter(event.value, 'laundrystatus', 'equals');
        this.setState({selectedStatus: event.value});
    }
    render() {
        const customerArray = [];
        const statusFilter = this.renderStatusFilter();
        firebase.database().ref('/customers').on('value', function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                customerArray.push(childSnapshot.toJSON());
            });
      });

    // const db = firebase.database().ref()
    // const fullAddress = values.address + ', ' + values.city + ', ' + values.state;
    // db.child('customers/' + taskId).set({
    //         id: 01,
    //         reshall: values.title
    // })
    // db.child('users/' + userid + '/posted_tasks/' + taskId).set('unstarted');

      if (this.state.editing) {
          var header = <div style={{ textAlign: 'left' }}>
              <Button type="button" style={{ backgroundColor: '#6a09a4', borderColor: '#6a09a4', marginRight: 10 }} icon="pi pi-external-link" iconPos="left" label="CSV" onClick={this.export}>
              </Button>
              <Button type="button" style={{ backgroundColor: '#6a09a4', borderColor: '#6a09a4', marginRight: 10 }} icon="pi pi-pencil" iconPos="left" label="SAVE" onClick={this.save}>
              </Button>
          </div>;
      } else {
          var header = <div style={{ textAlign: 'left' }}>
              <Button type="button" style={{ backgroundColor: '#6a09a4', borderColor: '#6a09a4', marginRight: 10 }} icon="pi pi-external-link" iconPos="left" label="CSV" onClick={this.export}>
              </Button>
              <Button type="button" style={{ backgroundColor: '#6a09a4', borderColor: '#6a09a4', marginRight: 10 }} icon="pi pi-pencil" iconPos="left" label="EDIT" onClick={this.edit}>
              </Button>
          </div>;

      }
        return (
            <div>
                <div className="card">
                    <h1 style={{ fontSize: '16px' }}>Customer Database</h1>
                    <DataTable value={customerArray} header={header} ref={(el) => { this.dt = el; }} style={{ marginBottom: '20px' }} responsive={true} autoLayout={true} >
                        <Column field="id" header="ID" sortable={true} />
                        <Column field="name" header="Name" sortable filter filterPlaceholder="Search by name" />
                        <Column field="email" header="Email" sortable={true} />
                        <Column field="phone" header="Phone" sortable={true} />
                        <Column field="laundrystatus" header="Bag Status" sortable={true} filter filterElement={statusFilter} body={this.statusBodyTemplate} />
                    </DataTable>
                </div>

                {/* </div> */}
            </div>
        );
    }
}

// selectionMode = "single" selection = { this.state.selectedCar } onSelectionChange = {(e) => this.setState({ selectedCar: e.value })}
