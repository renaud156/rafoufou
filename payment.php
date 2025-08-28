
<?php
require 'vendor/autoload.php'; // Nécessite stripe-php via Composer

\Stripe\Stripe::setApiKey('sk_test_51JrQavHZNKOUyQCokLmeY5XHwxjQnA0QqdfscYE7ukHSLx4ffrPXYl8AKXNp90hNlbULTIEfOkw3CDVETTUzA5mW00lKvOJnlA');

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

try {
    $paymentIntent = \Stripe\PaymentIntent::create([
        'amount' => $input['amount'],
        'currency' => 'eur',
        'description' => 'Paiement Tennis Impact - Leçon individuelle',
        'automatic_payment_methods' => ['enabled' => true],
    ]);
    echo json_encode(['clientSecret' => $paymentIntent->client_secret]);
} catch (Error $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
