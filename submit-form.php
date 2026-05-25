<?php
declare(strict_types=1);

$recipientEmail = 'justin@frontiergrowth.io';
$fromEmail = 'noreply@frontiergrowth.io';
$siteName = 'Frontier Growth';
$thankYouUrl = '/thank-you';

function clean_value(string $value): string
{
    $value = str_replace(["\r", "\n"], ' ', $value);
    return trim(strip_tags($value));
}

function redirect_to(string $path): never
{
    header('Location: ' . $path, true, 303);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect_to('/');
}

if (!empty($_POST['bot-field'] ?? '')) {
    redirect_to($thankYouUrl);
}

$startedAt = isset($_POST['started_at']) ? (int) $_POST['started_at'] : 0;
if ($startedAt > 0 && (time() - $startedAt) < 2) {
    redirect_to($thankYouUrl);
}

$name = clean_value((string) ($_POST['name'] ?? ''));
$company = clean_value((string) ($_POST['company'] ?? ''));
$email = clean_value((string) ($_POST['email'] ?? ''));
$category = clean_value((string) ($_POST['category'] ?? ''));
$market = trim(strip_tags((string) ($_POST['market'] ?? '')));
$page = clean_value((string) ($_POST['page'] ?? 'Website'));

if ($name === '' || $email === '' || $category === '' || $market === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo 'Please go back and complete all required fields with a valid email address.';
    exit;
}

$submittedAt = date('Y-m-d H:i:s T');
$ipAddress = clean_value((string) ($_SERVER['REMOTE_ADDR'] ?? 'Unknown'));
$userAgent = clean_value((string) ($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'));

$subject = sprintf('[%s] New inquiry from %s', $siteName, $name);
$messageLines = [
    'New website inquiry',
    '',
    'Submitted at: ' . $submittedAt,
    'Page source: ' . $page,
    '',
    'Name: ' . $name,
    'Company: ' . ($company !== '' ? $company : 'Not provided'),
    'Email: ' . $email,
    'Service category: ' . $category,
    'Target market / message:',
    $market,
    '',
    'Technical details:',
    'IP address: ' . $ipAddress,
    'User agent: ' . $userAgent,
];
$message = implode("\n", $messageLines);

$headers = [
    'From: ' . $siteName . ' <' . $fromEmail . '>',
    'Reply-To: ' . $name . ' <' . $email . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion(),
];

$storageDir = __DIR__ . '/form-submissions';
if (!is_dir($storageDir)) {
    mkdir($storageDir, 0755, true);
}

$csvPath = $storageDir . '/submissions.csv';
$isNewFile = !file_exists($csvPath);
$csvHandle = fopen($csvPath, 'ab');
if ($csvHandle !== false) {
    if ($isNewFile) {
        fputcsv($csvHandle, ['submitted_at', 'page', 'name', 'company', 'email', 'category', 'market', 'ip_address', 'user_agent']);
    }

    fputcsv($csvHandle, [$submittedAt, $page, $name, $company, $email, $category, $market, $ipAddress, $userAgent]);
    fclose($csvHandle);
}

$sent = mail($recipientEmail, $subject, $message, implode("\r\n", $headers), '-f' . $fromEmail);
if (!$sent) {
    error_log('Frontier Growth form email failed for ' . $email);
}

redirect_to($thankYouUrl);
