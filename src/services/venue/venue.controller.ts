
import { Response,Request, response } from "express";
import { CreateVenueServices, deleteVenueByIdServices, getAllDetailsForVenue, getAllVenueServices, getVenueByIdServices, searchVenuesByName, updateVenueServices } from "./venue.service";

// Get all Venues
export const GetAllVenues = async(req: Request, res: Response) =>{
    try {
        const AllVenues = await getAllVenueServices();
        if(!AllVenues || AllVenues.length === 0){
            res.status(404).json({message: "No Venues Found😔"});
        }
        else{
            res.status(200).json(AllVenues)
        }
    } catch (error: any) {
        res.status(500).json({error: error.message || "Error Occured! Failed To Fetch Venue 😥"})        
    }
}

// Get Venue By Name
export const getVenueByName = async (req: Request, res: Response)=>{
   const VenueName =  req.params.name;   
   try {
    const venueBYName = await getVenueByIdServices(VenueName);
    if(!venueBYName){
        res.status(404).json({message: "No venue Found 😔"})
    }
    else{
        res.status(200).json(venueBYName)
    }
   } catch (error: any) {
    res.status(500).json({error: error.message || "error Occured! Failed To Fetch Venue😥"})
   }
}

// Search venue by Name
export const searchVenue = async(req: Request,res: Response) => {
    const searchName = req.query.name as string;
    if(!searchName){
        res.status(400).json({error: "Missing Name query parameter"});
        return;
    }
    try {
        const searchVenueDetails = await searchVenuesByName(searchName)
        if(!searchVenueDetails || searchVenueDetails.length === 0){
            res.status(404).json({message: "No Venue Found With That Name😔"});
        }else{
            res.status(200).json(searchVenueDetails);
        }
    } catch (error: any) {
        res.status(500).json({error: error.message || "Errror Occured Failed to fearch Venue😥"})
    }
}

// Get full Venue Details 
export const venueDetails = async (req: Request, res: Response) =>{
    const venueName = req.query.name as string;
    if(!venueName){
        res.status(400).json({error: "Missing Name query parameter🥲"});
        return;
    }
    try {
        const venue_Details = await getAllDetailsForVenue(venueName);
        if(!venue_Details ){
            res.status(404).json("No Venue Name Like That...Try Again🥲")
        }else{
            res.status(200).json(venue_Details);
        }
    } catch (error:any) {
        res.status(500).json({error: error.message || "Error Occured...Failed To Fetch Venue Details🥲"});
    }
}

// Create a Venue
export const CreateVenue = async(req: Request, res: Response) =>{
    const {name, address, capacity ,status} = req.body;
    if(!name || !address || !capacity || !status ){
       res.status(400).json({ error: "⚠️ All Fields Are Required" });
    }
    try {
     const results = await CreateVenueServices({name, address, capacity ,status});
     res.status(200).json({message: results});
        
    } catch (error:any) {
    res.status(500).json({error: "⚠️ " + (error.message || "Error Occured while creating Venue")})
   }
}

// Deleting A venue
export const DeleteVenue = async(req: Request, res: Response) =>{
    const venueId = parseInt(req.params.id);
    if(isNaN(venueId)){
        res.status(400).json({ error: "🚫 Invalid Venue ID" });
        return;
    }
    
   try {
    const result = await deleteVenueByIdServices(venueId);
    res.status(200).json({ message: "✅ Venue Deleted Suuceesfully"}); 
  } catch (error: any) {
    res.status(500).json({ error: "🚫 " + (error.message || "Failed to delete Venue") });
  }
}
// Updating Venue
export const updateVenue = async (req: Request, res: Response) => {
  const venueId = parseInt(req.params.id);
  if (isNaN(venueId)) {
    res.status(400).json({ error: "🚫 Invalid venue ID" });
    return;
  }
  const { name, address, capacity} = req.body;
  if (!name || !address || !capacity  ) {
    res.status(400).json({ error: "⚠️ All fields are required" });
    return;
  }
  try {
    const result = await updateVenueServices(venueId, { name, address, capacity });
    res.status(200).json({ message: "✅ " + result });
  } catch (error: any) {
    res.status(500).json({ error: "🚫 " + (error.message || "Failed to update venue") });
  }
};