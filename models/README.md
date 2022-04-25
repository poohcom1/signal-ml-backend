# Models Directory

## YAML File configuration
File name: At the moment, the file MUST be named `manifest.sml.yaml`

### Data fields

| Name  | Description |
| -- | -- |
| name | Name of the model |
| description | Description of the model. Will be displayed on the model settings dialogue box |
| link | Option link to the model website |
| format | File format. Currently only midi is supported |
| parameters | An object of options to be displayed to the user and injected into the script. |
| script | An array of commands to run when converting |

### Parameter fields
```yaml
paramName:
  type: "enum" | "string" | "int" | "float"
  default: any
  # Optional fields
  enum: array
  min: int | float
  max: int | float
```

#### Type display details
`enum` A dropdown selection box

`string` A text field

`int` A number input field

`float` A slider IF `min` and `max` is specifield. Otherwise a number input field

### Script keywords

| Name | Description |
| -- | -- |
| $DIR | Temporary directory of files |
| $BASENAME | Name of file to convert. `$BASENAME.wav` must be created by the end of the scripts (more flexibility will be implemented later on) |
| $parameterName | Value from the `parameters` field that the user as set |

## `manifest.sml.yaml` example

```yaml
name: NEUTRINO
description:
  "A Japanese neural-network singing synthesizer. Lyrics can be written in hiragana or katakana.
  Note: Avoid note overlaps in one track."
link: https://n3utrino.work/
format: midi
parameters:
  model:
    type: enum
    default: KIRITAN
    enum:
      - KIRITAN
      - MERROW
      - ITAKO
      - ZUNKO
      - NAKUMO
      - YOKO
      - No.7
      - JUST
  styleShift:
    type: int
    default: 0
  pitchShift:
    type: float
    default: 1.0
    min: 0.0
    max: 2.0
  formantShift:
    type: float
    default: 1.0
    min: 0.0
    max: 2.0
  smoothPitch:
    type: float
    default: 1.0
    min: 0.0
    max: 2.0
  smoothFormant:
    type: float
    default: 1.0
    min: 0.0
    max: 2.0
  enhanceBreathiness:
    type: float
    default: 1.0
    min: 0.0
    max: 2.0
trimStart: 4

script:
  - ren $DIR\$BASENAME $BASENAME.midi
  - Musescore3.exe -o $DIR\$BASENAME.musicxml $DIR\$BASENAME.midi
  - timeout 1
  - py helpers\mscore_convert.py $DIR\$BASENAME.musicxml $TEMPO
  - mkdir $DIR\full
  - mkdir $DIR\timing
  - mkdir $DIR\mono
  - bin\musicXMLtoLabel.exe $DIR\$BASENAME.musicxml $DIR\full\$BASENAME.lab $DIR\mono\$BASENAME.lab
  - bin\NEUTRINO.exe $DIR\full\$BASENAME.lab $DIR\timing\$BASENAME.lab $DIR\$BASENAME.f0 $DIR\$BASENAME.mgc $DIR\$BASENAME.bap model\$model\ -n 3 -k $styleShift -m -t
  - bin\WORLD.exe $DIR\$BASENAME.f0 $DIR\$BASENAME.mgc $DIR\$BASENAME.bap -f $pitchShift -m $formantShift -p $smoothPitch -c $smoothFormant -b $enhanceBreathiness -o $DIR\$BASENAME_syn.wav -n 3 -t
  - bin\NSF_IO.exe $DIR\full\$BASENAME.lab $DIR\timing\$BASENAME.lab $DIR\$BASENAME.f0 $DIR\$BASENAME.mgc $DIR\$BASENAME.bap $model $DIR\$BASENAME.wav -t
```
