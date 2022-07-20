import { MDBBtn, MDBIcon, MDBTextArea, MDBContainer, MDBDatatable, MDBModal, MDBModalBody, MDBModalContent, MDBModalDialog, MDBModalHeader, MDBModalTitle, MDBBtnGroup, MDBRow, MDBCol, MDBSpinner } from "mdb-react-ui-kit";
import { useEffect, useState } from "react";
import { useElapsedTime } from "use-elapsed-time";


export default function Results({closeBtn}){

    const DNASequence = document.getElementById("query-textarea").value

    const [loading, setLoading] = useState(true);
    const {elapsedTime} = useElapsedTime({isPlaying: true});

    const [blastn_nrnt, setBlastn_nrnt] = useState(null);

    useEffect(() => {
        console.log(DNASequence + " from results");
        fetch("https://blast.ncbi.nlm.nih.gov/Blast.cgi?PROGRAM=blastn&DATABASE=nt&QUERY="+ DNASequence +"&CMD=Put")
            .then(data => data.text())
            .then(data => {
                const [id, seconds] = data.match("QBlastInfoBegin(.|\n)*?(QBlastInfoEnd)")[0].split("\n").slice(1, -1).map(value => value.replace("RID = ", "").replace("RTOE = ", "").replace("\s/g", ""));
                console.log(id)
                console.log(seconds)
        });
        
    }, [])
    

    return (
        <MDBModal show staticBackdrop>
            <MDBModalDialog size="xl">
                <MDBModalContent style={{backgroundColor: "#202020", color: "#fff"}}>
                    <MDBModalHeader>
                        <MDBModalTitle>
                        {loading ? "BLASTing..." : "BLAST Results"}
                        </MDBModalTitle>
                        <MDBBtn onClick={closeBtn} className="btn-close" color="white"/>
                    </MDBModalHeader>
                    {loading ? <MDBModalBody>
                        <center>
                            <MDBSpinner color="white" className="mb-4 mt-4"/>
                            <p className="mb-0">{(new Date(Number(String(elapsedTime).split(".")[0]) * 1000)).toISOString().slice(14, 19)} - It may take a while to run all the BLAST searches required.</p>
                            <p className="sub-p">Please leave this page open - it will automatically refresh when done</p>
                            <iframe className="pt-4" src="http://slither.io/" width="90%" height="450px"/>
                            <p className="sub-p">The game will disconnect when done.</p>
                        </center>
                    </MDBModalBody>:
                    <MDBModalBody>
                        <img src="./DSAPR/images/results/rocketPrimase.png" alt="rocket primase" width="100%"/>
                        <h5>Your DNA Sequence</h5>
                        <textarea
                            id="query-textarea"
                            readOnly
                            value={DNASequence}
                            style={{border: "0px solid black", backgroundColor: "rgba(50, 50, 50, 50)", color: "#fff", borderRadius: "3px", minWidth: "100%", paddingLeft: "10px", minHeight: "100px"}}
                        />
                        <h5>BLASTn</h5>
                        <MDBDatatable
                            data={{
                                columns: ['Organism Name', 'Description', 'E-Value', 'Accession #', 'Link'],
                                rows: [
                                    ['Tiger Nixon', 'System Architect', 'Edinburgh', '61', '2011/04/25', '$320,800'],
                                ]
                            }}
                            style={{backgroundColor: "#202020", color: "#fff"}}
                            dark
                        />
                        <MDBRow>
                            <MDBCol>
                                <h5>Protein Sequence</h5>
                            </MDBCol>
                            <MDBCol>
                                <MDBBtnGroup>
                                    <MDBBtn className="pt-1 pb-1" style={{backgroundColor: "#505050"}}>
                                        Frame 1
                                    </MDBBtn>
                                    <MDBBtn className="pt-1 pb-1" style={{backgroundColor: "#505050"}}>
                                        Frame 2
                                    </MDBBtn>
                                    <MDBBtn className="pt-1 pb-1" style={{backgroundColor: "#505050"}}>
                                        Frame 3
                                    </MDBBtn>
                                </MDBBtnGroup>
                                <MDBBtn className="ms-5 pt-1 pb-1" style={{backgroundColor: "#505050"}}>
                                    Rerun Blast p
                                </MDBBtn>
                            </MDBCol>
                        </MDBRow>
                        <textarea
                            id="query-textarea"
                            readOnly
                            value="replace with protein seq"
                            style={{border: "0px solid black", backgroundColor: "rgba(50, 50, 50, 50)", color: "#fff", borderRadius: "3px", minWidth: "100%", paddingLeft: "10px", minHeight: "100px"}}
                        />
                        <h5>BLASTx</h5>
                        <MDBDatatable
                            data={{
                                columns: ['Organism Name', 'Description', 'E-Value', 'Accession #', 'Link'],
                                rows: [
                                    ['Tiger Nixon', 'System Architect', 'Edinburgh', '61', '2011/04/25', '$320,800'],
                                ]
                            }}
                            style={{backgroundColor: "#202020", color: "#fff"}}
                            dark
                        />
                        <h5>BLASTp</h5>
                        <MDBDatatable
                            data={{
                                columns: ['Organism Name', 'Description', 'E-Value', 'Accession #', 'Link'],
                                rows: [
                                    ['Tiger Nixon', 'System Architect', 'Edinburgh', '61', '2011/04/25', '$320,800'],
                                ]
                            }}
                            style={{backgroundColor: "#202020", color: "#fff"}}
                            dark
                        />
                    </MDBModalBody>}
                </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>
    );
}