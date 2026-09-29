import { useEffect, useState } from "react";
import "./AdminBookings.css";

interface Booking {
  id: number;
  client_name: string;
  email: string;
  phone: string;
  event_date: string;
  location: string | null;
  message: string | null;
  status:
    | "pending"
    | "confirmed"
    | "completed"
    | "cancelled";
  created_at: string;
  service_name: string;
  service_price: number | null;
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = sessionStorage.getItem("wureyes_token");

  async function loadBookings() {
    if (!token) {
      setError("Session expired. Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/bookings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (response.status === 401) {
        sessionStorage.removeItem("wureyes_token");
        sessionStorage.removeItem("wureyes_user");

        window.location.href = "/admin/login";
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load bookings"
        );
      }

      setBookings(result.data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load bookings"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function updateStatus(
    id: number,
    status: Booking["status"]
  ) {
    if (!token) {
      setError("Session expired. Please login again.");
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/bookings/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to update booking"
        );
      }

      setBookings((current) =>
        current.map((booking) =>
          booking.id === id
            ? {
                ...booking,
                status,
              }
            : booking
        )
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update booking"
      );
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  }

  function formatPrice(price: number | null) {
    if (price === null) {
      return "-";
    }

    return `Rp ${Number(price).toLocaleString(
      "id-ID"
    )}`;
  }

  function formatCreatedAt(date: string) {
    return new Date(date).toLocaleString(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  return (
    <div className="bookings-admin">

      <div className="bookings-header">
        <div>
          <p className="bookings-label">
            WUREYES BOOKINGS
          </p>

          <h2>
            Client Bookings
          </h2>
        </div>

        <button
          className="bookings-refresh"
          onClick={loadBookings}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bookings-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bookings-loading">
          Loading bookings...
        </div>
      ) : bookings.length === 0 ? (
        <div className="bookings-empty">
          <strong>
            No bookings yet.
          </strong>

          <p>
            New bookings submitted from the
            website will appear here.
          </p>
        </div>
      ) : (
        <div className="bookings-grid">

          {bookings.map((booking) => (

            <article
              className="booking-card"
              key={booking.id}
            >

              <div className="booking-card-top">

                <div>
                  <span className="booking-id">
                    BOOKING #{booking.id}
                  </span>

                  <h3>
                    {booking.client_name}
                  </h3>
                </div>

                <span
                  className={`booking-status ${booking.status}`}
                >
                  {booking.status}
                </span>

              </div>


              <div className="booking-service">

                <span>
                  SERVICE
                </span>

                <strong>
                  {booking.service_name}
                </strong>

                <small>
                  {formatPrice(
                    booking.service_price
                  )}
                </small>

              </div>


              <div className="booking-details">

                <div>
                  <span>
                    EVENT DATE
                  </span>

                  <strong>
                    {formatDate(
                      booking.event_date
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    LOCATION
                  </span>

                  <strong>
                    {booking.location || "-"}
                  </strong>
                </div>

                <div>
                  <span>
                    EMAIL
                  </span>

                  <strong>
                    {booking.email}
                  </strong>
                </div>

                <div>
                  <span>
                    PHONE
                  </span>

                  <strong>
                    {booking.phone}
                  </strong>
                </div>

              </div>


              {booking.message && (
                <div className="booking-message">

                  <span>
                    CLIENT MESSAGE
                  </span>

                  <p>
                    {booking.message}
                  </p>

                </div>
              )}


              <div className="booking-footer">

                <small>
                  Submitted{" "}
                  {formatCreatedAt(
                    booking.created_at
                  )}
                </small>

                <select
                  value={booking.status}
                  onChange={(event) =>
                    updateStatus(
                      booking.id,
                      event.target.value as Booking["status"]
                    )
                  }
                >
                  <option value="pending">
                    Pending
                  </option>

                  <option value="confirmed">
                    Confirmed
                  </option>

                  <option value="completed">
                    Completed
                  </option>

                  <option value="cancelled">
                    Cancelled
                  </option>
                </select>

              </div>

            </article>

          ))}

        </div>
      )}

    </div>
  );
}