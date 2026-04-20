-- SQL View: latest price per product
CREATE OR REPLACE VIEW current_product_price AS
SELECT p.prodCode,
       p.description,
       p.unit,
       ph.unitPrice,
       ph.effDate
FROM product p
JOIN priceHist ph ON ph.prodCode = p.prodCode
WHERE ph.effDate = (
  SELECT MAX(effDate)
  FROM priceHist
  WHERE prodCode = p.prodCode
)
AND p.record_status = 'ACTIVE'
ORDER BY p.prodCode;