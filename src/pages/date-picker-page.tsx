import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { DatePicker } from '@/shared/date-picker'
import type { DateRangeValue } from '@/shared/date-picker'

function formatDate(value: string | null) {
  return value ?? 'empty'
}

function formatRange(value: DateRangeValue) {
  const [fromDate, toDate] = value
  return `[${formatDate(fromDate)}, ${formatDate(toDate)}]`
}

export function DatePickerPage() {
  const [singleDate, setSingleDate] = useState<string | null>(null)
  const [range, setRange] = useState<DateRangeValue>([null, null])
  const [requiredDate, setRequiredDate] = useState<string | null>(null)
  const requiredMissing = requiredDate === null

  return (
    <div className="flex flex-col gap-8">
      <Typography variant="h4" component="h1">
        Date picker
      </Typography>

      <section className="flex flex-col gap-4">
        <Typography variant="h6" component="h2">
          Single date
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Stores one YYYY-MM-DD value. Empty means nothing selected. The field
          can be cleared.
        </Typography>
        <div className="max-w-md">
          <DatePicker
            label="Created"
            value={singleDate}
            onChange={setSingleDate}
          />
        </div>
        <Typography variant="body2" component="p">
          <strong>Selected value:</strong> {formatDate(singleDate)}
        </Typography>
      </section>

      <section className="flex flex-col gap-4">
        <Typography variant="h6" component="h2">
          Date range
        </Typography>
        <Typography variant="body2" color="text.secondary">
          One control. The value is [fromDate, toDate]. Either date can be
          empty. When both are set, the start is an earlier day than the end.
          Clearing one bound leaves the other.
        </Typography>
        <div className="max-w-md">
          <DatePicker range label="Created" value={range} onChange={setRange} />
        </div>
        <Typography variant="body2" component="p">
          <strong>Selected value:</strong> {formatRange(range)}
        </Typography>
      </section>

      <section className="flex flex-col gap-4">
        <Typography variant="h6" component="h2">
          Form error
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The screen owns error and helper text. This field reports an error
          while the date is empty.
        </Typography>
        <div className="max-w-md">
          <DatePicker
            label="Start"
            value={requiredDate}
            onChange={setRequiredDate}
            error={requiredMissing}
            helperText={requiredMissing ? 'Date is required' : ' '}
          />
        </div>
        <Typography variant="body2" component="p">
          <strong>Selected value:</strong> {formatDate(requiredDate)}
        </Typography>
      </section>
    </div>
  )
}
