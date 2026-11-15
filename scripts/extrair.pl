#!/usr/bin/env perl
#
# extrair.pl - transforma o HTML do bibliacatolica.com.br em registros TSV.
#
# Uso:  extrair.pl <modo>  < arquivo.html
#
# Modos:
#   livros      -> testamento \x1f slug \x1f nome
#   capitulos   -> numero do capitulo (um por linha)
#   versiculos  -> numero \x1f texto \x1f nota(0|1)
#   notas       -> referencia \x1f texto

use strict;
use warnings;
use utf8;

binmode STDIN,  ':encoding(UTF-8)';
binmode STDOUT, ':encoding(UTF-8)';

my $modo = shift @ARGV;
if (!defined $modo) {
    print STDERR "uso: extrair.pl <livros|capitulos|versiculos|notas>\n";
    exit 2;
}

local $/;
my $html = <STDIN>;
$html = '' unless defined $html;

sub limpar {
    my ($t) = @_;
    $t =~ s/<a\b[^>]*>(.*?)<\/a>/$1/gs;
    $t =~ s/<br\s*\/?>/ /gs;
    $t =~ s/<[^>]+>//g;
    $t =~ s/&nbsp;/ /g;
    $t =~ s/&quot;/"/g;
    $t =~ s/&#0*39;|&apos;/'/g;
    $t =~ s/&lt;/</g;
    $t =~ s/&gt;/>/g;
    $t =~ s/&amp;/&/g;
    $t =~ s/\x{a0}/ /g;
    $t =~ s/\x{ad}//g;
    $t =~ s/\s+/ /g;
    $t =~ s/^ | $//g;
    return $t;
}

if ($modo eq 'livros') {
    my $testamento = '';
    my %vistos;
    my $re = qr{
        <h2>\s*((?:Antigo|Novo)\s+Testamento)\s*</h2>
      | <a\s+href="https://www\.bibliacatolica\.com\.br/[^"/]+/([^"/]+)/1/"
            \s+title="([^"]*)"
    }sx;

    while ($html =~ /$re/g) {
        if (defined $1) {
            $testamento = ($1 =~ /Antigo/i) ? 'AT' : 'NT';
            next;
        }
        my ($slug, $nome) = ($2, $3);
        next unless defined $slug && length $slug;
        next unless length $testamento;
        next if $vistos{$slug}++;
        print join("\x1f", $testamento, $slug, limpar($nome)), "\n";
    }
    exit 0;
}

if ($modo eq 'capitulos') {
    if ($html =~ /<ul class="[^"]*listChapter[^"]*">(.*?)<\/ul>/s) {
        my $bloco = $1;
        while ($bloco =~ /<a\b[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gs) {
            my $href = $1;
            next unless $href =~ m{/(\d+)/?$};
            print "$1\n";
        }
    }
    exit 0;
}

if ($modo eq 'versiculos') {
    if ($html =~ /<section class="entry clearfix">(.*?)<\/section>/s) {
        my $bloco = $1;
        while ($bloco =~ /<p>(.*?)<\/p>/gs) {
            my $p = $1;
            next unless $p =~ s/^<strong>\s*(\d+)\.\s*<\/strong>//;
            my $numero = $1;
            my $nota = ($p =~ s/\*\s*$//) ? 1 : 0;
            print join("\x1f", $numero, limpar($p), $nota), "\n";
        }
    }
    exit 0;
}

if ($modo eq 'notas') {
    if ($html =~ /Notas de rodap[eé]:\s*<\/h3>(.*?)(?=<hr\s*\/?>|<\/section>)/s) {
        my $bloco = $1;
        while ($bloco =~ /<p>\s*<strong>([^<]+)<\/strong>\s*-\s*(.*?)<\/p>/gs) {
            my ($ref, $texto) = ($1, $2);
            print join("\x1f", limpar($ref), limpar($texto)), "\n";
        }
    }
    exit 0;
}

print STDERR "modo desconhecido: $modo\n";
exit 2;
