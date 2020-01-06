import React, { useState, useEffect } from 'react';
import { Route } from 'react-router'
import { HashRouter, Link } from 'react-router-dom'
import {Breadcrumb, Card, Collapse, Button, Table} from 'react-bootstrap';
import ReactMarkdown from 'react-markdown/with-html';

import 'bootstrap/dist/css/bootstrap.css';

const api_url = process.env.REACT_APP_API_URL;
const cchdo_url = "https://cchdo.ucsd.edu";

const rmd = (string) => <ReactMarkdown source={string.join("/n")} escapeHtml={false} />

function listOrFiller(jsx_alm_array){
    if (jsx_alm_array.every(function(e){return e===undefined})){
      jsx_alm_array = (
          <li>-</li>
          )
    }
    return jsx_alm_array;

}

function IntroPane(){
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <Card.Body>
      <Card.Title>Welcome to the NSF-funded Microstructure Database</Card.Title>
      <p>
        This database provides a compilation of various datasets obtained from ocean microstructure profilers capable of measuring the smallest scales of oceanic turbulence.
        <Button variant="link" onClick={() => setOpen(!open)}> more >></Button>
      </p>

      <Collapse in={open}>
        <div>
          {rmd`
Data from microstructure programs have been provided by the data owners (PIs) or has been digitized from historical papers.
For the data given from PIs, data has been archived as CF-compliant NETCDF files with 1-m binned data, where possible, saving the variables: time, depth, pressure, temperature, salinity, latitude, longitude as well as the newly designated variables: epsilon (ocean turbulent kinetic energy dissipation rate in W/kg), and when available, chi-t (ocean dissipation rate of thermal variance from microtemperature in degrees C<sup>2</sup>/s), and chi-c (ocean dissipation rate of thermal variance from microconductivity in degrees C<sup>2</sup>/s).
Database entries include the program names and program PIs as well cruise information (research ship, ports of entry and exit, cruise dates, and chief scientist).
Relevant cruise reports, program related papers and other documents are also contained in the data archive.

Data digitized from PEQUOD, PATCHEX, and WESPAC historical documents include mean profiles of dissipation.

When available, additional supplementary data is provided such as shipboard ADCP and meteorological data.
This data has been provided by the data owners (PIs) and has been included in the database as is without further quality checks by CCHDO.

Newly obtained microstructure data can be uploaded to the microstructure database by sending 1-m binned data to the CCHDO group at https://cchdo.ucsd.edu/submit.

Citation for data sets that had pressure and/or depth cacluated using the GSW Oceanographic Toolbox:  McDougall, T.J. and P.M. Barker, 2011: Getting started with TEOS-10 and the Gibbs Seawater (GSW) Oceanographic Toolbox, 28pp., SCOR/IAPSO WG127, ISBN 978-0-646-55621-5.

As part of the Climate Process Team on internal wave driven mixing and creation of this microstructure database, a corresponding GitHub repository has been set up as a community supported and maintained set of best practice routines for calculating various mixing related variables. https://github.com/OceanMixingCommunity/Standard-Mixing-Routines

Andy Pickering wrote a python notebook to show how to extract the microstructure database data. 
This notebook, Examine_mixing_data.ipynb, contains examples of reading and plotting netcdf files in the mixing database with python. 
It is part of the Ocean Mixing Community GitHub repository Standard-Mixing-Routines. [Reading Mixing Database Files with Python](https://github.com/OceanMixingCommunity/Standard-Mixing-Routines/blob/master/Examine_mixing_data.ipynb)
          `}
        </div>
      </Collapse>
      </Card.Body>
    </Card>
  )
}

function PlaceholderLi(props) {
  const hasContent = props.children && props.children.length;
  if (hasContent) {
    return props.children
  } else {
    return <li>-</li>
  }
}

function CruisePage(props){
    console.log(props)
    if (Object.keys(props.cruises).length === 0){
      return <div>Loading...</div>
    }
    const expocode = props.match.params.expocode;
    const {cruise, files} = props.cruises[expocode]

    var expocode_link = <a href={cchdo_url + "/cruise/" + cruise.expocode}>{cruise.expocode}</a>;
    
    let microstructure_pis = cruise["participants"].filter(person => (person.role === "Microstructure PI"));
    var institutions = new Set(microstructure_pis.map(pi => pi.institution));

    var hrp_owners= listOrFiller(microstructure_pis.map(pi => <li key={pi.name}>{pi.name}</li>));

    

    var chi_scis = listOrFiller(cruise["participants"].map(function(person){
      if (person.role === "Chief Scientist"){
        institutions.add(person.institution);
        return (
            <li key={person.name}>{person.name}</li>
            )
      }
    }));

    institutions = listOrFiller([...institutions].map(function(inst){
      return (
          <li key={inst}>{inst}</li>
          )
    }));
    

    var dataset = files.map(function(file){
      if (file.role === 'dataset' && file.data_type === 'hrp'){
      return (
          <li key={file.file_hash}><a href={cchdo_url + file.file_path}>{file.file_name}</a></li>
          )
      }
    });
    var reports = files.map(function(file){
      if (file.role === 'dataset' && file.data_type === 'documentation'){
      return (
          <li key={file.file_hash}><a href={cchdo_url + file.file_path}>{file.file_name}</a></li>
          )
      }
    });

    var unprocessed = files.reduce(function(fileList, file) {
      if (file.role === 'unprocessed' && file.data_type === 'hrp'){
        fileList.push(<li key={file.file_hash}><a href={cchdo_url + file.file_path}>{file.file_name}</a></li>)
      }
      return fileList
    }, []);

    var intermediate = files.reduce(function(fileList, file) {
      if (file.role === 'intermediate' && file.data_type === 'hrp'){
        fileList.push(<li key={file.file_hash}><a href={cchdo_url + file.file_path}>{file.file_name}</a></li>)
      } 
      return fileList
    }, []);


    var raw = files.reduce(function(fileList, file) {
      if (file.role === 'raw' && file.data_type === 'hrp'){
        fileList.push(<li key={file.file_hash}><a href={cchdo_url + file.file_path}>{file.file_name}</a></li>)
      } 
      return fileList
    }, []);

    var unprocessed_files = function(unprocessed) {
      if (unprocessed.length) {
        return (
          <div>
          <h5>Unprocessed</h5>
          <ul>
            {unprocessed}
          </ul>
          </div>
        )
      }
    }

    var intermediate_files = function(intermediate) {
      if (intermediate.length) {
        return (
          <div>
          <h5>Intermediate</h5>
          <ul>
            {intermediate}
          </ul>
          </div>
        )        
      }
    }

    var raw_files = function(raw) {
      if (raw.length) {
        return (
          <div>
          <h5>Raw</h5>
          <ul>
            {raw}
          </ul>
          </div>
        )        
      }
    }

    var supplemental_files = function(raw, intermediate, unprocessed) {
      if (raw.length || intermediate.length || unprocessed.length) {
        return (
          <div>
          <h4>Data As Received</h4>
          {unprocessed_files(unprocessed)}
          {intermediate_files(intermediate)}
          {raw_files(raw)}
          </div>
        )       
      }
    }

    var references;
    if (cruise.hasOwnProperty("references")){

      references = listOrFiller(cruise["references"].map(function(ref){

      var href, text;
      var organization;
      var link = ref.value;
      var value = ref.value;

      if (ref.hasOwnProperty("properties")){
        for (const prop in ref.properties){
          if (prop === "href"){
            href = ref.properties.href;
          }
          if (prop === "text"){
            text = ref.properties.href;
          }
        }
      }
      if (ref.organization){
        organization = <b>({ref.organization})</b>;
      }
      if (ref.type === "link" || href){
        if (href){
          link = href;
        }
        if (text){
          value = text;
        }
        return (
          <li>{ref.type}: {organization} <a href={link}>{value}</a></li>
        )
      } else {
        return (
          <li>{ref.type}: {organization} {value}</li>
        );
      }
      }));
    }

    return (
        <div>
         <Breadcrumb>
           <Breadcrumb.Item href="#/">
             Programs
           </Breadcrumb.Item>
          <Breadcrumb.Item active>
            {cruise.sites["microstructure.ucsd.edu"].name}
          </Breadcrumb.Item>
         </Breadcrumb>

        <dl className="row">
        <dt className="col-sm-3 text-md-right">Expocode</dt>
        <dd className="col-sm-9">{expocode_link}</dd>
        <dt className="col-sm-3 text-md-right">Data Owner/PI</dt>
        <dd className="col-sm-9"><ul className="list-unstyled">{hrp_owners}</ul></dd>
        <dt className="col-sm-3 text-md-right">Chief Scientist(s)</dt>
        <dd className="col-sm-9"><ul className="list-unstyled">{chi_scis}</ul></dd>
        <dt className="col-sm-3 text-md-right">Dates</dt>
        <dd className="col-sm-9">{cruise.startDate}/{cruise.endDate}</dd>
        <dt className="col-sm-3 text-md-right">Port Out</dt>
        <dd className="col-sm-9">{cruise.start_port}</dd>
        <dt className="col-sm-3 text-md-right">Port In</dt>
        <dd className="col-sm-9">{cruise.end_port}</dd>
        <dt className="col-sm-3 text-md-right">Ship</dt>
        <dd className="col-sm-9">{cruise.ship}</dd>
        <dt className="col-sm-3 text-md-right">Institutions</dt>
        <dd className="col-sm-9"><ul className="list-unstyled">{institutions}</ul></dd>
        <dt className="col-sm-3 text-md-right">References</dt>
        <dd className="col-sm-9"><ul className="list-unstyled">{references}</ul></dd>        
        </dl>
        <h4>Microstructure NetCDF Dataset</h4>
        <ul>
          {dataset}
        </ul>
        <h4>Reports</h4>
        <ul>
          {reports}
        </ul>


        {supplemental_files(raw, intermediate, unprocessed)}

        
        </div>
        )
}

function CruiseList(props){
    console.log(props);

    let expocodes = Object.keys(props.cruises).sort((a, b) => {
      const compare_a = props.cruises[a].cruise.sites["microstructure.ucsd.edu"].name;
      const compare_b = props.cruises[b].cruise.sites["microstructure.ucsd.edu"].name;
      return compare_a.localeCompare(compare_b)
    });

    var programs = expocodes.map(function (expocode){
      let program =props.cruises[expocode]
      return (
        <tr key={program.cruise.expocode}>
          <td ><Link to={`/cruise/${program.cruise.expocode}`}>{program.cruise.sites["microstructure.ucsd.edu"].name}</Link>
          </td>
          <td>
            {program.cruise.start_port}
          </td>            
          <td>
            {program.cruise.startDate}
          </td>
          <td>
            {program.cruise.endDate}
          </td>
        </tr>
          )
    });

    return (
      <div>
        {/*
         <Breadcrumb>
           <Breadcrumb.Item active>
             Programs
           </Breadcrumb.Item>
         </Breadcrumb>
        */}

        <IntroPane />

        <h2>Microstructure Programs</h2>

        <Table striped hover size="sm">
          <thead>
            <tr>
              <th>Program Name</th>
              <th>Port Out</th>
              <th>Start Date</th>
              <th>End Date</th>
            </tr>
          </thead>
          <tbody>
            {programs}
          </tbody>
        </Table>

      </div>
    )
}


function Microstructure() {
  const [cruises, setCruises] = useState({})

  useEffect(() => {
    fetch(api_url)
      .then((response) => response.json())
      .then((json) => {
        setCruises(Object.fromEntries(json.cruises.map((c) => [c.cruise.expocode, c])));
      });
  }, [])

  return (
    <div>
      <h3>microstructure.ucsd.edu</h3>
      <HashRouter>
        <div>
          <Route exact path="/" render={props => <CruiseList {...props} cruises={cruises} />} />
          <Route path="/cruise/:expocode" render={props => <CruisePage {...props} cruises={cruises} />} />
        </div>
      </HashRouter>
    </div>
  );
}

function App() {
  return (
    <Microstructure source={api_url} />
  )
}

export default App;
