import React, { Component } from 'react';
import { FullCalendar } from 'primereact/fullcalendar';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export class Calendar extends Component {
    constructor() {
        super();
        this.state = {
            layout: 'list',
            sortOptions: [
                { label: 'Newest First', value: '!year' },
                { label: 'Oldest First', value: 'year' },
                { label: 'Brand', value: 'brand' }
            ],
        };}

    render() {
        let fullcalendarOptions = {
            plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
            defaultView: 'dayGridMonth',
            defaultDate: '2016-02-01',
            header: {
                left: 'prev,next',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            editable: true
        };

        return (
            <div className="p-grid">
                <div className="p-col-12">
                    <div className="card">
                        <h1>Calendar Page</h1>
                        <p>Use this page to add calendar for Rez Laundry ops.</p>
                        <FullCalendar events={this.state.fullCalendarEvents} options={fullcalendarOptions} />
                    </div>
                </div>
            </div>
        );
    }
}