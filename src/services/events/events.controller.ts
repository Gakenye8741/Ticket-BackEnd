import { Request, Response } from "express";
import {
  getAllEventsService,
  getEventByIdService,
  getEventsByTitleService,
  getEventsByCategoryService,
  createEventService,
  updateEventService,
  deleteEventService,
  getEventsByUserIdService,
} from "./events.service";

// Get all events
export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const allEvents = await getAllEventsService();
    if (!allEvents || allEvents.length === 0) {
      res.status(404).json({ message: "🔍 No events found" });
    } else {
      res.status(200).json(allEvents);
    }
  } catch (error: any) {
    res.status(500).json({ error: "🚫 " + (error.message || "Failed to retrieve events") });
  }
};

// Get event by ID
export const getEventById = async (req: Request, res: Response) => {
  const eventId = parseInt(req.params.id);
  if (isNaN(eventId)) {
    res.status(400).json({ error: "🚫 Invalid event ID" });
    return;
  }
  try {
    const event = await getEventByIdService(eventId);
    if (!event) {
      res.status(404).json({ message: "🔍 Event not found" });
    } else {
      res.status(200).json(event);
    }
  } catch (error: any) {
    res.status(500).json({ error: "🚫 " + (error.message || "Failed to retrieve event") });
  }
};

// Get event by title
export const getEventsByTitle = async (req: Request, res: Response) => {
  const title = req.query.title as string;

  if (!title) {
    res.status(400).json({ error: "⚠️ Missing title query parameter" });
    return;
  }

  try {
    const events = await getEventsByTitleService(title);
    if (!events || events.length === 0) {
      res.status(404).json({ message: `🔍 No events found with title containing "${title}"` });
      return;
    }

    res.status(200).json(events);
  } catch (error: any) {
    res.status(500).json({ error: "🚫 " + (error.message || "Error searching events by title") });
  }
};

// Get events by category
export const getEventsByCategory = async (req: Request, res: Response) => {
  const category = req.query.category as string;

  if (!category) {
    res.status(400).json({ error: "⚠️ Missing category query parameter" });
    return;
  }

  try {
    const events = await getEventsByCategoryService(category);
    if (!events || events.length === 0) {
      res.status(404).json({ message: `🔍 No events found in category "${category}"` });
      return;
    }

    res.status(200).json(events);
  } catch (error: any) {
    res.status(500).json({ error: "🚫 " + (error.message || "Error searching events by category") });
  }
};

// Create event
export const createEvent = async (req: Request, res: Response) => {
  const { title, description, venueId, category, date, time, ticketPrice, ticketsTotal } = req.body;

  if (!title || !venueId || !date || !time || !ticketPrice || !ticketsTotal) {
    res.status(400).json({ error: "⚠️ Essential fields (title, venueId, date, time, ticketPrice, ticketsTotal) are required" });
    return;
  }

  const parsedVenueId = parseInt(venueId);
  const parsedTicketPrice = parseFloat(ticketPrice);
  const parsedTicketsTotal = parseInt(ticketsTotal);

  if (isNaN(parsedVenueId) || isNaN(parsedTicketPrice) || isNaN(parsedTicketsTotal)) {
    res.status(400).json({ error: "🚫 Invalid data types for venueId, ticketPrice, or ticketsTotal" });
    return;
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const timeRegex = /^(?:2[0-3]|[01]?[0-9]):(?:[0-5]?[0-9])(?::(?:[0-5]?[0-9]))?$/;

  if (!date.match(dateRegex)) {
    res.status(400).json({ error: "🚫 Date format must be YYYY-MM-DD" });
    return;
  }

  if (!time.match(timeRegex)) {
    res.status(400).json({ error: "🚫 Time format must be HH:MM or HH:MM:SS" });
    return;
  }

  try {
    const newEvent = {
      title,
      description: description || null,
      venueId: parsedVenueId,
      category: category || null,
      date,
      time,
      ticketPrice: parsedTicketPrice.toString(),
      ticketsTotal: parsedTicketsTotal,
      ticketsSold: 0,
    };

    const message = await createEventService(newEvent);
    res.status(201).json({ message: "✅ " + message });
  } catch (error: any) {
    res.status(500).json({ error: "🚫 " + (error.message || "Failed to create event") });
  }
};

// Update event
export const updateEvent = async (req: Request, res: Response) => {
  const eventId = parseInt(req.params.id);
  if (isNaN(eventId)) {
    res.status(400).json({ error: "🚫 Invalid event ID" });
    return;
  }

  const updateData: { [key: string]: any } = {};
  for (const key in req.body) {
    if (req.body.hasOwnProperty(key)) {
      let value = req.body[key];
      if (key === 'venueId' || key === 'ticketsTotal' || key === 'ticketsSold') {
        value = parseInt(value);
        if (isNaN(value)) {
          res.status(400).json({ error: `🚫 Invalid number format for ${key}` });
          return;
        }
      } else if (key === 'ticketPrice') {
        value = parseFloat(value);
        if (isNaN(value)) {
          res.status(400).json({ error: `🚫 Invalid number format for ${key}` });
          return;
        }
      } else if (key === 'date') {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!value.match(dateRegex)) {
          res.status(400).json({ error: "🚫 Date format must be YYYY-MM-DD" });
          return;
        }
      } else if (key === 'time') {
        const timeRegex = /^(?:2[0-3]|[01]?[0-9]):(?:[0-5]?[0-9])(?::(?:[0-5]?[0-9]))?$/;
        if (!value.match(timeRegex)) {
          res.status(400).json({ error: "🚫 Time format must be HH:MM or HH:MM:SS" });
          return;
        }
      }
      updateData[key] = value;
    }
  }

  if (Object.keys(updateData).length === 0) {
    res.status(400).json({ error: "📝 No fields provided for update" });
    return;
  }

  try {
    const result = await updateEventService(eventId, updateData);
    res.status(200).json({ message: "🔄 " + result });
  } catch (error: any) {
    res.status(500).json({ error: "🚫 " + (error.message || "Failed to update event") });
  }
};

// Delete event
export const deleteEvent = async (req: Request, res: Response) => {
  const eventId = parseInt(req.params.id);
  if (isNaN(eventId)) {
    res.status(400).json({ error: "🚫 Invalid event ID" });
    return;
  }

  try {
    const result = await deleteEventService(eventId);
    res.status(200).json({ message: "🗑️ " + result });
  } catch (error: any) {
    res.status(500).json({ error: "🚫 " + (error.message || "Failed to delete event") });
  }
};

// Get events by user's national ID
export const getEventsByUserId = async (req: Request, res: Response) => {
  const nationalId = parseInt(req.params.nationalId);

  if (isNaN(nationalId)) {
    res.status(400).json({ error: "🚫 Invalid national ID" });
    return;
  }

  try {
    const events = await getEventsByUserIdService(nationalId);
    if (events.length === 0) {
      res.status(404).json({ message: `🔍 No events found for user with national ID: ${nationalId}` });
    } else {
      res.status(200).json(events);
    }
  } catch (error: any) {
    res.status(500).json({ error: "🚫 " + (error.message || "Failed to retrieve events by user ID") });
  }
};