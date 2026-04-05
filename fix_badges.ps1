$c = [IO.File]::ReadAllText('src\app\shop\page.tsx')
$old = @"
              product.category === 'Electronics' ? 'bg-blue-50 text-blue-600 border-blue-100' :
              product.category === 'Fashion' ? 'bg-pink-50 text-pink-600 border-pink-100' :
              product.category === 'Audio' ? 'bg-purple-50 text-purple-600 border-purple-100' :
              'bg-indigo-50 text-indigo-600 border-indigo-100'
"@
$new = @"
              product.category === 'Electronics' ? 'bg-blue-50 text-blue-600 border-blue-100' :
              product.category === 'Audio' ? 'bg-purple-50 text-purple-600 border-purple-100' :
              product.category === 'Accessories' ? 'bg-green-50 text-green-600 border-green-100' :
              product.category === 'Devices' ? 'bg-cyan-50 text-cyan-600 border-cyan-100' :
              'bg-indigo-50 text-indigo-600 border-indigo-100'
"@
if ($c.Contains($old)) {
    $c = $c.Replace($old, $new)
    [IO.File]::WriteAllText('src\app\shop\page.tsx', $c)
    Write-Host "SUCCESS: Badge colors updated"
} else {
    Write-Host "STRING NOT FOUND"
}
