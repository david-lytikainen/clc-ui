import React, { useEffect, useState } from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, List, ListItem, Link, Pagination, CircularProgress } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';
import { getAdminOrders } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PER_PAGE = 10;

const AdminTools: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const [data, setData] = useState<{ orders_by_number: Record<string, any[]>; total: number; page: number } | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin()) {
      return;
    }
    setLoading(true);
    getAdminOrders(page, PER_PAGE)
      .then((res) => setData({ orders_by_number: res.orders_by_number, total: res.total, page: res.page }))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [isAuthenticated, isAdmin, page]);

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Please sign in to view admin tools.</Typography>
      </Box>
    );
  }

  if (!isAdmin()) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Access denied.</Typography>
      </Box>
    );
  }

  const orderNumbers = data ? Object.keys(data.orders_by_number) : [];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin tools
      </Typography>
      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Update Orders</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <List>
                {orderNumbers.map((orderNumber) => {
                  const orders = data!.orders_by_number[orderNumber] || [];
                  const totalCents = orders.reduce((s, o) => s + (o.amount_cents || 0), 0);
                  const first = orders[0];
                  const created = first?.created_at ? new Date(first.created_at).toLocaleDateString() : '—';
                  return (
                    <ListItem key={orderNumber} sx={{ display: 'block', py: 1 }}>
                      <Link
                        component="button"
                        variant="body1"
                        onClick={() => navigate(`/orders/${orderNumber}`)}
                        sx={{ cursor: 'pointer', textAlign: 'left' }}
                      >
                        Order #{orderNumber} — {created} — ${(totalCents / 100).toFixed(2)} ({orders.length} item{orders.length !== 1 ? 's' : ''})
                      </Link>
                    </ListItem>
                  );
                })}
              </List>
              {data && data.total > PER_PAGE && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Pagination
                    count={Math.ceil(data.total / PER_PAGE)}
                    page={page}
                    onChange={(_, p) => setPage(p)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default AdminTools;
