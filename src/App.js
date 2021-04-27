import React from 'react';
import './App.css';
import { Row, Col, Table, Form } from "react-bootstrap";
import result from './result.json'
import airlines from './airlines.json'
class App extends React.Component {
    constructor() {
        super()

        const airlinesCode = result.Data.PricedItineraries.map(item => item.ValidatingAirlineCode)
        const airlinesNameMap = {}
        const airlinesData = airlines.filter((item) => {
            airlinesNameMap[item.iata] = item.name
            return airlinesCode.includes(item.iata)
        })
        const filteredAirlines = {}
        airlinesData.forEach((item) => {
            filteredAirlines[item.iata] = true
        })

        this.state = {
            airlinesCode,
            airlinesData,
            airlinesNameMap,
            filteredAirlines,
            showSuccessPage: false,
            selectedFlight: null
        }

        this.renderFlightDetails = this.renderFlightDetails.bind(this)
        this.renderAirlines = this.renderAirlines.bind(this)
        this.handleGoBack = this.handleGoBack.bind(this)
    }

    getDurationTime(flightDetails) {
        const hours = flightDetails.JourneyDuration / 60
        const minutes = flightDetails.JourneyDuration % 60
        return `${hours} Hours ${minutes} Mins`
    }

    renderFlightDetails() {
        const { airlinesNameMap, filteredAirlines } = this.state

        return <Table responsive className="spacing">
            <tbody>
                {result.Data.PricedItineraries.map((item, index) => {
                    if (!filteredAirlines[item.ValidatingAirlineCode]) {
                        return null
                    }
                    const flightDetails = item.OriginDestinationOptions[0].FlightSegments[0]
                    const {
                        ArrivalDateTime,
                        DepartureDateTime,
                        DepartureAirportLocationCode,
                        ArrivalAirportLocationCode,
                        StopQuantity
                    } = flightDetails
                    const arrivalDate = new Date(ArrivalDateTime)
                    const departDate = new Date(DepartureDateTime)
                    const { CurrencyCode, Amount } = item.AirItineraryPricingInfo.ItinTotalFare.TotalFare

                    return <tr className="bg-grey" key={`${index}-${ArrivalAirportLocationCode}-${DepartureAirportLocationCode}`}>
                        <td className="align-middle">{airlinesNameMap[item.ValidatingAirlineCode]}</td>
                        <td className="text-right">
                            <span>{`${arrivalDate.getHours()}:${arrivalDate.getMinutes()}`}</span><br />
                            <span className="font-weight-bold">{ArrivalAirportLocationCode}</span><br />
                            <span>{arrivalDate.toDateString()}</span>
                        </td>
                        <td className="text-center">
                            <span>{this.getDurationTime(flightDetails)}</span><br />
                            <span>{StopQuantity ? `${StopQuantity} Stops` : 'Non-Stop'}</span>
                        </td>
                        <td className="text-left">
                            <span>{`${departDate.getHours()}:${departDate.getMinutes()}`}</span><br />
                            <span className="font-weight-bold">{DepartureAirportLocationCode}</span><br />
                            <span>{departDate.toDateString()}</span>
                        </td>
                        <td className="bg-dark align-middle text-light cursor-point" onClick={this.handleBookFlight.bind(this, flightDetails)}>
                            <span>Book Flight</span><br />
                            <span>{`${CurrencyCode} ${Amount}`}</span>
                        </td>
                    </tr>
                }).filter(item => item)
                }
            </tbody>
        </Table>
    }

    handleBookFlight(item) {
        this.setState({
            showSuccessPage: true,
            selectedFlight: item
        })
    }

    handleGoBack() {
        this.setState({
            showSuccessPage: false,
            selectedFlight: null
        })
    }

    handleAirlineFilter(airline) {
        const { filteredAirlines } = this.state

        filteredAirlines[airline.iata] = !filteredAirlines[airline.iata]

        this.setState({
            filteredAirlines
        })
    }

    renderAirlines() {
        const { airlinesData, filteredAirlines } = this.state

        return airlinesData.map((item) => {
            return <Form.Check
                type="checkbox"
                checked={filteredAirlines[item.iata]}
                key={item.iata}
                label={item.name}
                onChange={this.handleAirlineFilter.bind(this, item)}
            />
        })
    }

    renderSuccess() {
        const {
            ArrivalDateTime,
            DepartureAirportLocationCode,
            ArrivalAirportLocationCode,
        } = this.state.selectedFlight
        const arrivalDate = new Date(ArrivalDateTime)

        return <div className="text-center">
            <h2>Success</h2>
            <p>{`Your flight from ${ArrivalAirportLocationCode}-${DepartureAirportLocationCode} on ${arrivalDate.toDateString()} is confirmed`}</p>
            <button type="button" className="btn btn-primary" onClick={this.handleGoBack}>Go Back</button>
        </div>
    }

    renderDefault() {
        return <Row className="m-2">
            <Col md="2" className="text-left mt-2">
                <h4>Filter By Airlines</h4>
                {this.renderAirlines()}
            </Col>
            <Col md="10">{this.renderFlightDetails()}</Col>
        </Row>
    }

    render() {
        const { showSuccessPage } = this.state

        return (
            <div className="App">
                {showSuccessPage ? this.renderSuccess() : this.renderDefault()}
            </div>
        );
    }
}

export default App;
