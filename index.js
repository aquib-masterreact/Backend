const express = require("express");
const app = express();
const electricians = require("./electricianData.json");
const sites = require("./rawSiteData.json");
const cors = require("cors");
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

app.get("/electricians", (req, res) => {
  res.json(electricians);
});

app.get("/sites", (req, res) => {
  res.json(sites);
});

app.put("/sites/:siteId", (req, res) => {
  const siteId = req.params.siteId;
  const newInstallationDate = req.body.installationDate;
  const siteToUpdate = sites.find((site) => site.name === siteId);
  if (siteToUpdate) {
    siteToUpdate.installationDate = newInstallationDate;
    res.json(siteToUpdate);
  } else {
    res.status(404).json({ message: "Site not found" });
  }
});
app.post("/assign-electricians", (req, res) => {
  const canAssign = (site, electrician) => {
    return (
      site.assignedElectrician.length < 3 &&
      (site.type !== "grievance" || electrician.type === "grievance")
    );
  };

  for (const site of sites) {
    if (site.AssignedElectritian.length >= 3) {
      continue;
    }
    const nextElectrician = electricians.find((e) => {
      return (
        (site.type === e.type || e.type === "grievance") &&
        !site.AssignedElectritian.some((ae) => ae.electricianName === e.name)
      );
    });

    if (nextElectrician) {
      site.AssignedElectritian.push({
        electricianName: nextElectrician.name,
        electricianAssignDate: new Date().toISOString(),
      });
    } else {
      console.log(`No available electrician for site ${site.name}`);
    }
  }

  res.json(sites);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
