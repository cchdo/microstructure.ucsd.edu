import { useState, useEffect, JSX } from "react";
import { Route, Routes } from "react-router";
import { HashRouter, Link, useParams } from "react-router-dom";
import { Breadcrumb, Card, Collapse, Button, Table } from "react-bootstrap";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

import "bootstrap/dist/css/bootstrap.css";

const api_url = import.meta.env.VITE_API_URL;
const cchdo_url = "https://cchdo.ucsd.edu";

const rmd = (string: TemplateStringsArray) => (
  <ReactMarkdown children={string.join("/n")} rehypePlugins={[rehypeRaw]} />
);

function IntroPane() {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <Card.Body>
        <Card.Title>
          Welcome to the NSF-funded Microstructure Database
        </Card.Title>
        <p>
          This database provides a compilation of various datasets obtained from
          ocean microstructure profilers capable of measuring the smallest
          scales of oceanic turbulence.
          <Button variant="link" onClick={() => setOpen(!open)}>
            {" "}
            more {">>"}
          </Button>
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

Newly obtained microstructure data can be uploaded to the microstructure database by sending 1-m binned data to the CCHDO group at <https://cchdo.ucsd.edu/submit>.

Citation for data sets that had pressure and/or depth cacluated using the GSW Oceanographic Toolbox:  McDougall, T.J. and P.M. Barker, 2011: Getting started with TEOS-10 and the Gibbs Seawater (GSW) Oceanographic Toolbox, 28pp., SCOR/IAPSO WG127, ISBN 978-0-646-55621-5.

As part of the Climate Process Team on internal wave driven mixing and creation of this microstructure database, a corresponding GitHub repository has been set up as a community supported and maintained set of best practice routines for calculating various mixing related variables. <https://github.com/OceanMixingCommunity/Standard-Mixing-Routines>

Andy Pickering wrote a python notebook to show how to extract the microstructure database data. 
This notebook, Examine_mixing_data.ipynb, contains examples of reading and plotting netcdf files in the mixing database with python. 
It is part of the Ocean Mixing Community GitHub repository Standard-Mixing-Routines. [Reading Mixing Database Files with Python](https://github.com/OceanMixingCommunity/Standard-Mixing-Routines/blob/master/Examine_mixing_data.ipynb)
          `}
          </div>
        </Collapse>
      </Card.Body>
    </Card>
  );
}

function FileListItem({ file }: { file: File }) {
  return (
    <li>
      <a href={cchdo_url + file.file_path}>{file.file_name}</a>
    </li>
  );
}

interface ConditionalFileListProps {
  header: string;
  files: JSX.Element[];
}

function ConditionalFileList({ header, files }: ConditionalFileListProps) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div>
      <h5>{header}</h5>
      <ul>{files}</ul>
    </div>
  );
}

interface SuplimentalFilesProps {
  raw: JSX.Element[];
  intermediate: JSX.Element[];
  unprocessed: JSX.Element[];
}

function SuplimentalFiles({
  raw,
  intermediate,
  unprocessed,
}: SuplimentalFilesProps) {
  if (
    raw.length === 0 &&
    intermediate.length === 0 &&
    unprocessed.length === 0
  ) {
    return null;
  }

  return (
    <div>
      <h4>Data As Received</h4>
      <ConditionalFileList header="Unprocessed" files={unprocessed} />
      <ConditionalFileList header="Intermediate" files={intermediate} />
      <ConditionalFileList header="Raw" files={raw} />
    </div>
  );
}

interface DlRowItemProps {
  dt: JSX.Element | string;
  dd: JSX.Element | string;
}

function DlRowItem({ dt, dd }: DlRowItemProps) {
  return (
    <>
      <dt className="col-sm-3 text-md-right">{dt}</dt>
      <dd className="col-sm-9">{dd}</dd>
    </>
  );
}

interface UnstyledListProps {
  content: JSX.Element[];
  fill?: JSX.Element[];
}

function UnstyledList({ content, fill }: UnstyledListProps) {
  if (fill === undefined) {
    fill = [<li key="filler">-</li>];
  }
  if (content.length === 0) {
    content = fill;
  }

  return <ul className="list-unstyled">{content}</ul>;
}
interface ConditionalLinkProps {
  href: string;
  children: JSX.Element;
}

const ConditionalLink = ({ href, children }: ConditionalLinkProps) =>
  href ? <a href={href}>{children}</a> : children;

interface CruisePageProps {
  cruises: CruiseMap;
  loaded: boolean;
}

type CruiseRouteParams = {
  expocode: string;
}

function CruisePage({ cruises, loaded }: CruisePageProps) {
  const { expocode } = useParams<CruiseRouteParams>();
  if (!loaded) {
    return <div>Loading...</div>;
  }
  const { cruise, files } = cruises.get(expocode!)!;

  const microstructure_pis = cruise["participants"].filter(
    (person) => person.role === "Microstructure PI"
  );
  let institutions = new Set<string>(
    microstructure_pis.map((pi) => pi.institution)
  );

  const hrp_owners = microstructure_pis.map((pi) => (
    <li key={pi.name}>{pi.name}</li>
  ));

  const chi_scis = cruise.participants
    .filter((person) => person.role === "Chief Scientist")
    .map((person) => {
      institutions.add(person.institution);
      return <li key={person.name}>{person.name}</li>;
    });

  const institutionList = [...institutions].map((inst) => (
    <li key={inst}>{inst}</li>
  ));

  const fileFilter = ({
    file,
    role,
    data_type,
  }: {
    file: File;
    role: string;
    data_type: string;
  }) => file.role === role && file.data_type === data_type;

  const dataset = files
    .filter((file) =>
      fileFilter({ file: file, role: "dataset", data_type: "hrp" })
    )
    .map((file) => <FileListItem key={file.file_hash} file={file} />);
  dataset.push(
    ...files
      .filter((file) =>
        fileFilter({ file: file, role: "ancillary", data_type: "hrp" })
      )
      .map((file) => <FileListItem key={file.file_hash} file={file} />)
  );
  dataset.push(
    ...files
      .filter((file) =>
        fileFilter({ file: file, role: "ancillary", data_type: "chipod" })
      )
      .map((file) => <FileListItem key={file.file_hash} file={file} />)
  );
  const reports = files
    .filter((file) =>
      fileFilter({ file: file, role: "dataset", data_type: "documentation" })
    )
    .map((file) => <FileListItem key={file.file_hash} file={file} />);

  const unprocessed = files
    .filter((file) =>
      fileFilter({ file: file, role: "unprocessed", data_type: "hrp" })
    )
    .map((file) => <FileListItem key={file.file_hash} file={file} />);
  const intermediate = files
    .filter((file) =>
      fileFilter({ file: file, role: "intermediate", data_type: "hrp" })
    )
    .map((file) => <FileListItem key={file.file_hash} file={file} />);
  const raw = files
    .filter((file) => fileFilter({ file: file, role: "raw", data_type: "hrp" }))
    .map((file) => <FileListItem key={file.file_hash} file={file} />);

  raw.push(
    ...files
      .filter((file) =>
        fileFilter({ file: file, role: "raw", data_type: "chipod" })
      )
      .map((file) => <FileListItem key={file.file_hash} file={file} />)
  );

  let references = cruise.references ?? [];

  let referenceList = references.map((ref) => {
    let href = ref.properties?.href;
    const value = ref.properties?.text ? ref.properties?.text : ref.value;
    const organization = ref.organization && <b>({ref.organization})</b>;

    href = ref.type === "link" ? ref.value : href;
    href = ref.type === "doi" ? `https://doi.org/${ref.value}` : href;

    return (
      <li key={value}>
        {ref.type}: {organization}{" "}
        <ConditionalLink href={href}>{value}</ConditionalLink>
      </li>
    );
  });

  return (
    <div>
      <Card body bg="light">
      <Breadcrumb>
        <Breadcrumb.Item href="#/">Programs</Breadcrumb.Item>
        <Breadcrumb.Item active>
          {cruise.sites["microstructure.ucsd.edu"].name}
        </Breadcrumb.Item>
      </Breadcrumb>
      </Card>

      <dl className="row">
        <DlRowItem
          dt="Expocode"
          dd={
            <a href={`${cchdo_url}/cruise/${cruise.expocode}`}>
              {cruise.expocode}
            </a>
          }
        />
        <DlRowItem
          dt="Data Owner/PI"
          dd={<UnstyledList content={hrp_owners} />}
        />
        <DlRowItem
          dt="Chief Scientist(s)"
          dd={<UnstyledList content={chi_scis} />}
        />
        <DlRowItem dt="Dates" dd={`${cruise.startDate}/${cruise.endDate}`} />
        <DlRowItem dt="Port Out" dd={cruise.start_port} />
        <DlRowItem dt="Port In" dd={cruise.end_port} />
        <DlRowItem dt="Ship" dd={cruise.ship} />
        <DlRowItem
          dt="Institutions"
          dd={<UnstyledList content={institutionList} />}
        />
        <DlRowItem
          dt="References"
          dd={<UnstyledList content={referenceList} />}
        />
      </dl>
      <h4>Microstructure NetCDF Dataset</h4>
      <ul>{dataset}</ul>
      <h4>Reports</h4>
      <ul>{reports}</ul>

      <SuplimentalFiles
        raw={raw}
        intermediate={intermediate}
        unprocessed={unprocessed}
      />
    </div>
  );
}

function CruiseList({ cruises }: { cruises: CruiseMap }) {
  const programs = [...cruises.values()].map((siteCruise) => {
    const cruise = siteCruise.cruise;
    return (
      <tr key={cruise.expocode}>
        <td>
          <Link to={`/cruise/${cruise.expocode}`}>
            {cruise.sites["microstructure.ucsd.edu"].name}
          </Link>
        </td>
        <td>{cruise.start_port}</td>
        <td>{cruise.startDate}</td>
        <td>{cruise.endDate}</td>
      </tr>
    );
  });

  return (
    <div>
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
        <tbody>{programs}</tbody>
      </Table>
    </div>
  );
}

interface Cruise {
  expocode: string;
  start_port: string;
  end_port: string;
  startDate: string;
  endDate: string;
  ship: string;
  participants: [
    {
      name: string;
      email: string;
      role: string;
      institution: string;
    }
  ];
  sites: {
    [key: string]: {
      name: string;
    };
  };
  references: [
    {
      type: string;
      organization: string;
      value: string;
      properties: { [key: string]: any };
    }
  ];
}

interface File {
  file_name: string;
  file_hash: string;
  role: string;
  data_type: string;
  file_path: string;
}

interface SiteCruise {
  cruise: Cruise;
  files: [File];
}

type CruiseMap = Map<string, SiteCruise>;

function Microstructure({ source }: { source: string }) {
  const [loaded, setLoaded] = useState(false);
  const [cruises, setCruises] = useState(new Map<string, SiteCruise>());

  useEffect(() => {
    fetch(source)
      .then((response) => response.json())
      .then((json) => {
        const cruises: [[string, SiteCruise]] = json.cruises
          .map((c: SiteCruise) => [c.cruise.expocode, c])
          .sort((a: [string, SiteCruise], b: [string, SiteCruise]) => {
            const compare_a = a[1].cruise.sites["microstructure.ucsd.edu"].name;
            const compare_b = b[1].cruise.sites["microstructure.ucsd.edu"].name;
            return compare_a.localeCompare(compare_b);
          });
        setCruises(new Map(cruises));
        setLoaded(true);
      });
  }, []);

  return (
    <div>
      <h3>microstructure.ucsd.edu</h3>
      <HashRouter>
        <div>
        <Routes>
          <Route
            path="/"
            element={<CruiseList cruises={cruises} />}
          />
          <Route
            path="/cruise/:expocode"
            element={<CruisePage cruises={cruises} loaded={loaded} />}
          />
          </Routes>
        </div>
      </HashRouter>
    </div>
  );
}

function App() {
  return <Microstructure source={api_url} />;
}

export default App;
