import { MDBBtn, MDBIcon, MDBTextArea, MDBContainer, MDBDatatable, MDBModal, MDBModalBody, MDBModalContent, MDBModalDialog, MDBModalHeader, MDBModalTitle, MDBBtnGroup, MDBRow, MDBCol, MDBSpinner } from "mdb-react-ui-kit";
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
                    }
                    );
            }
            else {
                setTimeout(() => checkBlast({ id, setResult, aftermath }), 30000);
            }
        });
}

function runBLAST({ db = "nt", program = "blastn", qDNA, setResult, aftermath }) {
    fetch("https://blast.ncbi.nlm.nih.gov/Blast.cgi?PROGRAM=" + program + "&DATABASE=" + db + "&QUERY=" + qDNA + "&CMD=Put")
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
        />
    );
}

export default function Results({ closeBtn }) {

    const DNASequence = document.getElementById("query-textarea").value

    const { elapsedTime } = useElapsedTime({ isPlaying: true });

    const [blastn_nrnt, setBlastn_nrnt] = useState(null);
    const [blastn_est, setBlastn_est] = useState(null);
    const [blastx_nrnt, setBlastx_nrnt] = useState(null);

    const loading = blastn_nrnt == null;

    useEffect(() => {

        const blastN_2 = () => {
            runBLAST({db: "est", program: "blastn", qDNA: DNASequence, setResult: setBlastn_est, aftermath: blastX});
        }

        const blastX = () => {
            console.log("All done!")
        }

        console.log(DNASequence + " from results");
        runBLAST({db: "nt", program: "blastn", qDNA: DNASequence, setResult: setBlastn_nrnt, aftermath: blastN_2});
        // checkBlast({id: "DHK9U13K01R", setResult: setBlastn_nrnt});
    }, [])

    const games = ["http://slither.io/", "https://moomoo.io", "https://youtube.com"];

    return (
        <MDBModal show staticBackdrop>
            <MDBModalDialog size="xl">
                <MDBModalContent style={{ backgroundColor: "#202020", color: "#fff" }}>
                    <MDBModalHeader>
                        <MDBModalTitle>
                            {loading ? "BLASTing..." : "BLAST Results"}
                        </MDBModalTitle>
                        {!loading && <MDBBtn onClick={closeBtn} className="btn-close" color="white" />}
                    </MDBModalHeader>
                    {loading ? <MDBModalBody>
                        <center>
                            <MDBSpinner color="white" className="mb-4 mt-4" />
                            <p className="mb-0">{(new Date(Number(String(elapsedTime).split(".")[0]) * 1000)).toISOString().slice(14, 19)} - It may take a while to run all the BLAST searches required.</p>
                            <p className="sub-p">Please leave this page open - it will automatically refresh when done</p>
                            <iframe className="pt-4" src={games[0]} width="90%" height="450px" />
                            <p className="sub-p">The game will disconnect when done.</p>
                        </center>
                    </MDBModalBody> :
                        <MDBModalBody>
                            <img src="./DSAPR/images/results/rocketPrimase.png" alt="rocket primase" width="100%" />
                            <h5>Your DNA Sequence</h5>
                            <textarea
                                id="query-textarea"
                                readOnly
                                value={DNASequence}
                                style={{ border: "0px solid black", backgroundColor: "rgba(50, 50, 50, 50)", color: "#fff", borderRadius: "3px", minWidth: "100%", paddingLeft: "10px", minHeight: "100px" }}
                            />
                            <h5>BLASTn NRNT</h5>
                            <BLASTTables blastSrc={blastn_nrnt}/>
                            <h5>BLASTn EST</h5>
                            <BLASTTables blastSrc={blastn_est}/>
                            <MDBRow>
                                <MDBCol>
                                    <h5>Protein Sequence</h5>
                                </MDBCol>
                                <MDBCol>
                                    <MDBBtnGroup>
                                        <MDBBtn className="pt-1 pb-1" style={{ backgroundColor: "#505050" }}>
                                            Frame 1
                                        </MDBBtn>
                                        <MDBBtn className="pt-1 pb-1" style={{ backgroundColor: "#505050" }}>
                                            Frame 2
                                        </MDBBtn>
                                        <MDBBtn className="pt-1 pb-1" style={{ backgroundColor: "#505050" }}>
                                            Frame 3
                                        </MDBBtn>
                                    </MDBBtnGroup>
                                    <MDBBtn className="ms-5 pt-1 pb-1" style={{ backgroundColor: "#505050" }}>
                                        Rerun Blast p
                                    </MDBBtn>
                                </MDBCol>
                            </MDBRow>
                            <textarea
                                id="query-textarea"
                                readOnly
                                value="replace with protein seq"
                                style={{ border: "0px solid black", backgroundColor: "rgba(50, 50, 50, 50)", color: "#fff", borderRadius: "3px", minWidth: "100%", paddingLeft: "10px", minHeight: "100px" }}
                            />
                            {/* <h5>BLASTx</h5>
                            <BLASTTables blastSrc={blastx_nrnt} />
                            <h5>BLASTp</h5>
                            <BLASTTables blastSrc={blastx_nrnt} /> */}
                        </MDBModalBody>}
                </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>
    );
}