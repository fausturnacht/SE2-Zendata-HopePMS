-- SQL View: latest price per product
CREATE OR REPLACE VIEW current_product_price AS
SELECT p.prodCode,
       p.description,
       ph.unitPrice,
       ph.effDate
FROM product p
JOIN priceHist ph
  ON p.prodCode = ph.prodCode
WHERE ph.effDate = (
  SELECT MAX(effDate)
  FROM priceHist
  WHERE prodCode = p.prodCode
)
AND p.record_status = 'ACTIVE';
