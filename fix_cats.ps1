$c = [IO.File]::ReadAllText('src\app\shop\page.tsx')
$old = "['All', 'Electronics', 'Peripherals', 'Fashion', 'Audio'].map(cat => ("
$new = "['All', 'Electronics', 'Accessories', 'Audio', 'Devices'].map(cat => ("
if ($c.Contains($old)) {
    $c = $c.Replace($old, $new)
    [IO.File]::WriteAllText('src\app\shop\page.tsx', $c)
    Write-Host "SUCCESS"
} else {
    Write-Host "STRING NOT FOUND"
}
