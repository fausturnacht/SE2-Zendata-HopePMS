CREATE OR REPLACE VIEW top_selling_products AS
SELECT p.prodCode,
       p.description,
       SUM(sd.quantity) AS totalQty
FROM product p
JOIN salesDetail sd ON sd.prodCode = p.prodCode
WHERE p.record_status = 'ACTIVE'
GROUP BY p.prodCode, p.description
ORDER BY totalQty DESC
LIMIT 10;