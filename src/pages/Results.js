import { MDBBtn, MDBIcon, MDBTextArea, MDBContainer, MDBDatatable, MDBModal, MDBModalBody, MDBModalContent, MDBModalDialog, MDBModalHeader, MDBModalTitle, MDBBtnGroup, MDBRow, MDBCol, MDBSpinner, MDBCollapse } from "mdb-react-ui-kit";
import { useEffect, useState } from "react";
import { useElapsedTime } from "use-elapsed-time";

function checkBlast({ id, setResult, aftermath }) {
    if (id == undefined) {
        return;
    }

    console.log("fetch stuff")

    fetch("https://blast.ncbi.nlm.nih.gov/Blast.cgi?CMD=Get&RID=" + id)
        .then(data => data.text())
        .then(data => {
            const stats = data.match("QBlastInfoBegin(.|\n)*?(QBlastInfoEnd)")[0];
            console.log(stats);
            if (stats.includes("Status=READY")) {
                fetch("https://blast.ncbi.nlm.nih.gov/Blast.cgi?CMD=Get&FORMAT_TYPE=XML&RID=" + id)
                    .then(data => data.text())
                    .then(data => {
                        const parser = new DOMParser();
                        data = parser.parseFromString(data, "text/xml");
                        data = data.getElementsByTagName("Hit");
                        setResult(Array.from(data));
                        if (aftermath != null) {
                            setTimeout(aftermath, 30000);
                        }
                        return;
                    }
                    );
            }
            else {
                setTimeout(() => checkBlast({ id, setResult, aftermath }), 30000);
            }
        });
}

function runBLAST({ db = "nt", program = "blastn", qDNA, setResult, aftermath, additionalParams="" }) {

    console.log("https://blast.ncbi.nlm.nih.gov/Blast.cgi?PROGRAM=" + program + "&DATABASE=" + db + "&QUERY=" + qDNA + "&CMD=Put" + additionalParams)
    return;

    fetch("https://blast.ncbi.nlm.nih.gov/Blast.cgi?PROGRAM=" + program + "&DATABASE=" + db + "&QUERY=" + qDNA + "&CMD=Put" + additionalParams)
        .then(data => data.text())
        .then(data => {
            const [id, seconds] = data.match("QBlastInfoBegin(.|\n)*?(QBlastInfoEnd)")[0].split("\n").slice(1, -1).map(value => value.replace("RID = ", "").replace("RTOE = ", "").replace("\s/g", ""));
            console.log("id: " + id);
            checkBlast({id, setResult, aftermath})
        });
}

function BLASTTables({rows, blastSrc, cols = [
    "Accession #",
    "Description", 
    "E-Value", 
    "Start",
    "End",
    "Frame"
]}){

    if (blastSrc != null){
        rows = blastSrc.map(hit => {
            const HSP = hit.childNodes[11].childNodes[1];
            return [
                hit.childNodes[7].textContent,
                hit.childNodes[5].textContent, 
                HSP.childNodes[7].textContent.includes("e") ? (hit.childNodes[11].childNodes[1].childNodes[7].textContent.split(".")[0] + "e-" + hit.childNodes[11].childNodes[1].childNodes[7].textContent.split("-")[1]) : hit.childNodes[11].childNodes[1].childNodes[7].textContent, 
                HSP.childNodes[9].textContent,
                HSP.childNodes[11].textContent,
                HSP.childNodes[17].textContent,
            ]}
        )
    }

    if (rows == null)
    {
        rows = [];
    }

    return (
        <MDBDatatable
            entries={10}
            search
            entriesOptions={[10]}
            data={{
                columns: cols,
                rows: rows
            }}
            style={{ backgroundColor: "#202020", color: "#fff" }}
            dark
            searchInputProps={{contrast: true}}
        />
    );
}

export default function Results({ closeBtn }) {

    const DNASequence = document.getElementById("query-textarea-dna").value;
    const ProteinSequence = document.getElementById("query-textarea-protein").value;

    const { elapsedTime } = useElapsedTime({ isPlaying: true });

    const [openDNA, setOpenDNA] = useState(true);
    const [openProtein, setOpenProtein] = useState(true);
    const [openedN_nrnt, setOpenedN_nrnt] = useState(true);
    const [openedN_est, setOpenedN_est] = useState(true);
    const [openedX_nrnt, setOpenedX_nrnt] = useState(true);
    const [openedP_nrnt, setOpenedP_nrnt] = useState(true);

    const [blastn_nrnt, setBlastn_nrnt] = useState(null);
    const [blastn_est, setBlastn_est] = useState(null);
    const [blastx_nrnt, setBlastx_nrnt] = useState(null);
    const [blastp_nrnt, setBlastp_nrnt] = useState(null);

    const [loading, setLoading] = useState(true); //blastn_nrnt == null || blastn_est == null || blastx_nrnt == null //|| blastp_nrnt == null;

    useEffect(() => {

        const blastN_2 = () => {
            runBLAST({db: "est", program: "blastn", qDNA: DNASequence, setResult: setBlastn_est, aftermath: blastX});
        }

        const blastX = () => {
            runBLAST({db: "nr", program: "blastx", qDNA: DNASequence, setResult: setBlastx_nrnt, additionalParams: "&FILTER=F"});
            console.log("All done!")
        }

        const done = () => {
            setLoading(false);
        }

        console.log(DNASequence + " from results");
        // runBLAST({db: "nt", program: "blastn", qDNA: DNASequence, setResult: setBlastn_nrnt, aftermath: blastN_2});
        checkBlast({id: "DPU6G5NW013", setResult: setBlastn_nrnt});
        checkBlast({id: "DPU6G5NW013", setResult: setBlastn_est});
        checkBlast({id: "DPU6G5NW013", setResult: setBlastx_nrnt});
        setTimeout(done, 3000);
    }, [])

    return (
        <MDBModal show staticBackdrop>
            <MDBModalDialog size="xl" style={{color: "#000"}}>
                <MDBModalContent style={{ backgroundColor: "#202020", color: "#fff" }}>
                    <MDBModalBody>
                        <MDBContainer className="d-flex">
                            <MDBModalTitle style={{color: "#6a65fc"}} className="me-0 ms-0">
                                {loading ? "BLASTing..." : "BLAST Results"}
                            </MDBModalTitle>
                            {!loading && <MDBBtn onClick={closeBtn} className="ms-auto ps-2 pt-1 pe-2 pb-1" color="white" style={{backgroundColor: "#6a65fc", width: "25px", height: "25px"}}><MDBIcon icon="times" className="ms-0 me-0 ps-0 pe-0"/></MDBBtn>}
                        </MDBContainer>
                    </MDBModalBody>
                    {loading ? <MDBModalBody>
                        <center>
                            <MDBSpinner color="white" className="mb-4 mt-4" />
                            <p className="mb-0">{(new Date(Number(String(elapsedTime).split(".")[0]) * 1000)).toISOString().slice(14, 19)} - It may take a while to run all the BLAST searches required.</p>
                            <p className="sub-p">Please leave this page open - it will automatically refresh when done</p>
                            <iframe className="pt-4" src={"https://slither.io"} width="90%" height="450px" />
                            <p className="sub-p">The game will disconnect when done.</p>
                        </center>
                    </MDBModalBody> :
                        <MDBModalBody>
                            <img src="./DSAPR/images/results/rocketPrimase.png" alt="rocket primase" width="100%" />
                            <MDBBtn onClick={() => setOpenDNA(!openDNA)}
                                color="link"
                                className="mt-1 mb-1"
                                style={{color: "#6a65fc", backgroundColor: "#242424", width: "100%"}}
                            >DNA Sequence</MDBBtn>
                            <MDBCollapse show={openDNA}>
                                <h4 style={{color: "#6a65fc"}}>DNA Sequence</h4>
                                <textarea
                                    readOnly
                                    value={DNASequence}
                                    style={{ border: "0px solid black", backgroundColor: "#242424", color: "#fff", borderRadius: "3px", minWidth: "100%", paddingLeft: "10px", minHeight: "300px" }}
                                />
                            </MDBCollapse>

                            <MDBBtn onClick={() => setOpenedN_nrnt(!openedN_nrnt)}
                                color="link"
                                className="mt-1 mb-1"
                                style={{color: "#6a65fc", backgroundColor: "#242424", width: "100%"}}
                            >BLASTn NRNT</MDBBtn>
                            <MDBCollapse show={openedN_nrnt}>
                                <h4 style={{color: "#6a65fc"}}>BLASTn NRNT</h4>
                                <BLASTTables blastSrc={blastn_nrnt}/>
                            </MDBCollapse>

                            <MDBBtn onClick={() => setOpenedN_est(!openedN_est)}
                                color="link"
                                className="mt-1 mb-1"
                                style={{color: "#6a65fc", backgroundColor: "#242424", width: "100%"}}
                            >BLASTn EST</MDBBtn>
                            <MDBCollapse show={openedN_est}>
                                <h4 style={{color: "#6a65fc"}}>BLASTn EST</h4>
                                <BLASTTables blastSrc={blastn_est}/>
                            </MDBCollapse>

                            <MDBBtn onClick={() => setOpenProtein(!openProtein)}
                                color="link"
                                className="mt-1 mb-1"
                                style={{color: "#6a65fc", backgroundColor: "#242424", width: "100%"}}
                            >Protein Sequence</MDBBtn>
                            <MDBCollapse show={openProtein}>
                                <MDBRow>
                                    <MDBCol>
                                        <h4 style={{color: "#6a65fc"}}>Protein Sequence</h4>
                                    </MDBCol>
                                </MDBRow>
                                <textarea
                                    readOnly
                                    value={ProteinSequence}
                                    style={{ border: "0px solid white", backgroundColor: "#242424", color: "#fff", borderRadius: "3px", minWidth: "100%", paddingLeft: "10px", minHeight: "300px" }}
                                />
                            </MDBCollapse>

                            <MDBBtn onClick={() => setOpenedX_nrnt(!openedX_nrnt)}
                                className="mt-1 mb-1"
                                style={{color: "#6a65fc", backgroundColor: "#242424", width: "100%"}}
                            >BLASTx NR</MDBBtn>
                            <MDBCollapse show={openedX_nrnt}>
                                <h4 style={{color: "#6a65fc"}}>BLASTx NR</h4>
                                <BLASTTables blastSrc={blastx_nrnt} />
                            </MDBCollapse>

                            <MDBBtn onClick={() => setOpenedP_nrnt(!openedP_nrnt)}
                                color="link"
                                className="mt-1 mb-1"
                                style={{color: "#6a65fc", backgroundColor: "#242424", width: "100%"}}
                            >BLASTp NR</MDBBtn>
                            <MDBCollapse show={openedP_nrnt}>
                                <h4 style={{color: "#6a65fc"}}>BLASTp NR</h4>
                                <BLASTTables blastSrc={blastp_nrnt} />
                            </MDBCollapse>
                        </MDBModalBody>}
                </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>
    );
}