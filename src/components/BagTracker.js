import React, { Component } from 'react';
import { FullCalendar } from 'primereact/fullcalendar';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export class BagTracker extends Component {
    constructor() {
        super();
    }

    render() {


        return (
            <div className="p-grid">
                <div className="p-col-12">
                    <div className="card">
                        <h1>Bag Tracking</h1>
                        <p>Use this page for Rez Laundry ops to change bag status when working.</p>
                    </div>
                </div>
            </div>
        );
    }
}